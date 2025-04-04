import { Request, Response, Router } from "express"
import axios from "axios"
import multer from "multer"
import filetype from 'magic-bytes.js'
import { 
    Timestamp,
    writeBatch,
    doc,
    DocumentReference,
    DocumentData,
    WriteBatch,
} from "firebase/firestore"
import { 
    IArchiveItem, 
    IEntryAddedResponse, 
    EItemStatus, 
    ISource,
} from "../../@types"
import {
    addEntries,
} from "./addEntries"
import {
    fbStorage,
    buildArchiveItem,
    fbDb,
    doomPortsCollection,
    doomPortsIncomingCollection,
    generateFirestoreId,
    EUserRole,
    IsAuthorized,
    getEntriesByStatus,
    COLLECTION_NAME,
    updateDoomPort,
    statusStringToEnum,
    updateDoomPortQuery,
 } from "../../utils"
 import {
    authenticate,
    authorizeByRole,
 } from "../../middleware"

 
 const router = Router()


async function approveEntries(entries: IArchiveItem[], user, status: EItemStatus) {
    const result = await addEntries(entries, user)
    const batch = writeBatch(fbDb)

    result.success.forEach(async updatedEntry => {
        const entry = updatedEntry.entry
        // THe last value in the history list is the id of the entry that has been
        // reviewed in the doomPorts-Incoming collection.
        const reviewedEntryId = entry.editHistory[entry.editHistory.length - 1]
        const ref = doc(fbDb, COLLECTION_NAME.doomPortsIncoming, reviewedEntryId)
        const updateParams = {
            status,
        }
        batch.update(ref, updateParams)
    })
    await batch.commit()
    return result
} // approveEntries


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

    const snapshot = await getEntriesByStatus({ status: EItemStatus.pending, ids })
    const entries = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data()
        data.status = EItemStatus.published
        data.id = data.id || generateFirestoreId()
        if (!data.editHistory)
            data.editHistory = []

        data.editHistory.push(doc.id)
        return data
    }))

    let result: IEntryAddedResponse = null
    try {
        result = await approveEntries(entries, user, status)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Failed to update items status" })
    }

    const statusCode = result?.failed.length === 0 ? 201 : 206
    if (result.success.length === 0) {
       return res.status(400).json({ error: "No entries has been processed!", ...result })
    }

    return res.status(statusCode).json({ 
        message: "Entries has been reviewed",
        success: result?.success.map(s => s.id),
        failed: result?.failed.map(f => f.id || f.title), 
        // requestUrl: githubIssue?.url,
    })
})

 
 export default router
