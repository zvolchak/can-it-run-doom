import { Request, Response, Router } from "express"
import { Timestamp } from "firebase-admin/firestore"
import { 
    IEntryAddedResponse, 
    EItemStatus,
    IArchiveItem, 
} from "../../@types"
import { publicationFields } from "../../utils/publication"
import {
    fbDb,
    EUserRole,
    getEntriesByStatus,
    COLLECTION_NAME,
} from "../../utils"
import {
    authenticate,
    authorizeByRole,
} from "../../middleware"
import { notificationsEnabled, resolveIssue, sendDiscordNotification } from "../../utils/notifications"


const router = Router()


 /* Add entries to the doomPorts collection if approved and change its status in the 
  * doomPorts-Incoming collection. 
  */
export async function approveEntries(entries: { reviewId: string, entry: IArchiveItem }[], status: EItemStatus) {
    const result: IEntryAddedResponse = { success: [], failed: [] }
    await Promise.all(entries.map(async ({ reviewId, entry }) => {
        try {
            const incomingRef = fbDb.collection(COLLECTION_NAME.doomPortsIncoming).doc(reviewId)
            const { published, publicRef, created } = await fbDb.runTransaction(async transaction => {
                const incoming = await transaction.get(incomingRef)
                if (!incoming.exists || incoming.data().status !== EItemStatus.pending)
                    throw new Error("Submission is no longer pending")
                const publicRef = fbDb.collection(COLLECTION_NAME.doomPorts).doc(incoming.data().id || reviewId)
                // Read the target before any write, so concurrent approvals/edits retry.
                const current = await transaction.get(publicRef)
                const approved = status === EItemStatus.approved || status === EItemStatus.published
                let fields: IArchiveItem = { ...incoming.data(), status, id: publicRef.id }
                if (approved) {
                    fields = publicationFields({ ...incoming.data(), id: publicRef.id, status: EItemStatus.published },
                        current.exists ? current.data() : null, Timestamp.now())
                    fields.editHistory = [...new Set([...(current.data()?.editHistory || []), reviewId])]
                    transaction.set(publicRef, fields)
                }
                transaction.update(incomingRef, { status, updatedAt: Timestamp.now() })
                return { published: fields, publicRef, created: !current.exists }
            })
            result.success.push({ id: reviewId, entry: published, docRef: publicRef, file: null, created })
        } catch (error) {
            console.error(error)
            result.failed.push(entry)
        }
    }))
    return result
}


async function fetchIdsInChunks(ids: any[]) {
    const chunks = []
    for (let i = 0; i < ids.length; i += 30) {
      chunks.push(ids.slice(i, i + 30))
    }

    let allDocs = []
    for (const chunk of chunks) {
      const snap = await getEntriesByStatus({ status: EItemStatus.pending, ids: chunk })
      allDocs = allDocs.concat(snap.docs)
    }

    return allDocs
}


router.post(
    "/review", 
    authenticate,
    (req: Request, res: Response, next) => authorizeByRole(req, res, EUserRole.Moderator, next),
    async (req: Request, res: Response
): Promise<any> => {
    const { ids, status } = req.body as any

    if (![EItemStatus.approved, EItemStatus.published, EItemStatus.rejected].includes(status))
        return res.status(400).json({ error: "Invalid review status" })

    if (!ids || ids?.length === 0)
        return res.status(400).json({ error: "Missing list of ids!" })

    try {
        const snapshots = await fetchIdsInChunks(ids)
        const entries = snapshots.map(snapshot => ({
            reviewId: snapshot.id,
            entry: { ...snapshot.data(), id: snapshot.data().id || snapshot.id },
        }))

        let result: IEntryAddedResponse = null
        result = await approveEntries(entries, status)
        const statusCode = result?.failed.length === 0 ? 201 : 206
        if (result.success.length === 0) {
            return res.status(400).json({ error: "No entries has been processed!", ...result })
        }
        
        if (notificationsEnabled()) {
            await Promise.all(result.success.map(async (batch) => {
                const approved = status !== EItemStatus.rejected
                await resolveIssue(batch.entry, approved)
                // Only brand-new approved entries are announced; edits and rejections stay quiet.
                if (approved && batch.created)
                    await sendDiscordNotification(batch.entry)
            }))
        }

        return res.status(statusCode).json({ 
            message: "Entries has been reviewed",
            success: result?.success.map(s => s.id),
            failed: result?.failed.map(f => f.id || f.title), 
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Failed to update items status" })
    }
})

 
 export default router
