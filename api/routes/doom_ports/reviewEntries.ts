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
    doomPortsStagingCollection,
    generateFirestoreId,
    UserRole,
    IsAuthorized,
    getEntriesForReview,
    COLLECTION_NAME,
 } from "../../utils"
 import {
    authenticate,
    authorizeByRole,
 } from "../../middleware"

 
 const router = Router()


async function approveEntries(entries: IArchiveItem[], user) {
    const result = await addEntries(entries, user)
    const batch = writeBatch(fbDb)

    result.success.forEach(updatedEntry => {
        const ref = doc(fbDb, COLLECTION_NAME.doomPortsStaging, updatedEntry.id)
        batch.delete(ref)
    })
    await batch.commit()
    return result
} // approveEntries


router.post(
    "/review", 
    authenticate,
    (req: Request, res: Response, next) => authorizeByRole(req, res, UserRole.Moderator, next),
    async (req: Request, res: Response
): Promise<any> => {
    const { ids, isApproved } = req.body
    const user = req.user

    if (!ids || ids?.length === 0)
        return res.status(400).json({ error: "Missing list of ids!" })

    const snapshot = await getEntriesForReview({ ids })
    const entries = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data()
        data.isPublished = true
        return data
    }))

    let result: IEntryAddedResponse = null
    if (isApproved) {
        result = await approveEntries(entries, user)
    }

    const statusCode = result?.failed.length === 0 ? 201 : 206

    return res.status(statusCode).json({ 
        message: "Entries has been reviewed",
        success: result?.success.map(s => s.id),
        failed: result?.failed.map(f => f.id || f.title), 
        // requestUrl: githubIssue?.url,
    })
})

 
 export default router
