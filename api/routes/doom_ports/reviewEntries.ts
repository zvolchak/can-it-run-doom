import { Request, Response, Router } from "express"
import { 
    writeBatch,
    doc,
    getDoc,
} from "firebase/firestore"
import { 
    IEntryAddedResponse, 
    EItemStatus,
    IArchiveItem, 
} from "../../@types"
import {
    createEntriesBatch,
} from "./addEntries"
import {
    fbDb,
    EUserRole,
    getEntriesByStatus,
    COLLECTION_NAME,
    statusStringToEnum,
    IsLocalhost,
} from "../../utils"
import {
    authenticate,
    authorizeByRole,
} from "../../middleware"
import axios from "axios"

const secrets = process.env

const router = Router()


function getSuccessNotification(entry: IArchiveItem) {
    const entryUrl = `https://canitrundoom.org?id=${entry.id}`
    const submittedBy = entry?.submittedBy ? `Submitted by: ${entry.submittedBy}` : ""
    const content = `${entry.title}:\n${entryUrl}\n${submittedBy}`
    return content
} // getSuccessNotification


async function resolveIssue(entry: IArchiveItem): Promise<boolean> {
    if (!entry?.requestUrl)
        return false

    console.info(`- Attempting to resolve an issue "${entry.requestUrl}" for entry ${entry.id}`)
    const token = secrets.GITHUB_TOKEN
    if (!token) {
        console.warn(`Missing github token to resolve an issue ${entry?.id}: ${entry?.requestUrl}`)
        return
    }

    let comment = { body: getSuccessNotification(entry) }
    if (entry.status === EItemStatus.rejected) {
        comment = { 
            body: "This entry has been rejected. If reason will not be provided " + 
            "shortly, please reach out to support or leave comments here." 
        }
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
    }

    try {
        await axios.post(`${entry.requestUrl}/comments`, comment, { headers })
        await axios.patch(entry.requestUrl, { state: "closed"}, { headers })
    } catch (error) {
        console.error("Failed to resolve an issue for entry " +
            `${entry.id} : ${entry.requestUrl}`, error)
        return false
    }
    return true
} // resolveIssue


async function sendDiscordNotification(entry: IArchiveItem): Promise<boolean> {
    const webhook = secrets.DISCORD_ENTRY_NOTIFY_WEBHOOK
    if (!webhook)
        return false

    const payload = {
        content: getSuccessNotification(entry)
    }

    try {
        await axios.post(webhook, payload)
    } catch (error) {
        console.error("Failed to send discord notification for entry " +
            `${entry.id} : ${entry.requestUrl}`, error)
        return false
    }
    return true
} // sendDiscordNotification


 /* Add entries to the doomPorts collection if approved and change its status in the 
  * doomPorts-Incoming collection. 
  */
async function approveEntries(entries: any[], status: EItemStatus) {
    const result = { success: [], failed: [] }
    const batch = writeBatch(fbDb)
    const toUploadBatch = writeBatch(fbDb)
    await Promise.all(entries.map(async ({ reviewId, entry }) => {
        try {
            // The last value in the history list is the id of the entry that has been
            // reviewed in the doomPorts-Incoming collection. Use it to find the doc item
            // that is requested to be reviewed.
            // const reviewedEntryId = entry.editHistory[entry.editHistory.length - 1]
            const reviewedEntryId = reviewId
            delete entry.editHistory

            const toUpload = await createEntriesBatch(entry, toUploadBatch, null)
            result.success.push(toUpload)

            const ref = doc(fbDb, COLLECTION_NAME.doomPortsIncoming, reviewedEntryId)
            const updateParams = {
                status,
            }
            batch.update(ref, updateParams)
            const prodEntry = (await getDoc(toUpload.docRef)).data()

            const uploadedUpdateParams =  { 
                editHistory: [ ...(prodEntry?.editHistory || []), reviewedEntryId]
            }
            toUploadBatch.update(
                toUpload.docRef, 
                uploadedUpdateParams
            )
        } catch (error) {
            console.error(error)
            result.failed.push(entry)
        }

    }))
    
    await batch.commit()
    await toUploadBatch.commit()
    return result
} // approveEntries


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
    let { ids, status } = req.body as any
    status = statusStringToEnum(status)
    const user = req.user

    if (!ids || ids?.length === 0)
        return res.status(400).json({ error: "Missing list of ids!" })

    try {
        const snapshots = await fetchIdsInChunks(ids)
        const entries = await Promise.all(snapshots.map(async doc => {
            const data = doc.data()
            data.status = EItemStatus.published
            data.id = data.id || doc.id
            if (data.editHistory === null || data.editHistory === undefined)
                data.editHistory = []

            data.editHistory.push(doc.id)
            return { reviewId: doc.id, entry: data }
        }))

        let result: IEntryAddedResponse = null
        result = await approveEntries(entries, status)
        const statusCode = result?.failed.length === 0 ? 201 : 206
        if (result.success.length === 0) {
            return res.status(400).json({ error: "No entries has been processed!", ...result })
        }
        
        if (secrets.NODE_ENV === "production") {
            await Promise.all(result.success.map(async (batch) => {
                const hasIssueReolved = await resolveIssue(batch.entry)
                if (hasIssueReolved)
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
