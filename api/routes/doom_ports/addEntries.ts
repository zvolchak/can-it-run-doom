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
import { DecodedIdToken } from "firebase-admin/auth"
import { 
    IArchiveItem, 
    ISource,
    IEntryBatch,
    IEntryAddedResponse,
    EItemStatus,
} from "../../@types"
import {
    fbStorage,
    buildArchiveItem,
    fbDb,
    doomPortsCollection,
    doomPortsIncomingCollection,
    generateFirestoreId,
 } from "../../utils"

const router = Router()
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 400 * 1024 }
})
upload.none()


async function saveFileToStorage(fileName: string, file) {
    const storageFile = fbStorage.file(fileName)
    await storageFile.save(file.buffer, {
        metadata: { contentType: file.mimetype }
    })
    await storageFile.makePublic()
    const bucket_name = process.env.FB_STORAGE_BUCKET
    // const base_url = process.env.FB_STORAGE_PUBLIC_URL
    const public_url = `/v0/b/${bucket_name}/o/doom-preview-images%2F${fileName}?alt=media`
    return public_url
} // saveFileToStorage


function getFileType(buffer: string) {
    if (!buffer)
        return null
    const bytes = Array.from(buffer).slice(0, 12) as any
    const detectedMimeType = filetype(bytes)

    if (detectedMimeType?.length === 0)
        return null

    const mime = detectedMimeType[0].mime
    if (!mime.toLocaleLowerCase().startsWith("image"))
        throw Error("Only image files are supported!")

    return detectedMimeType[0].typename
} // getFileType


function sourcesArrayToFirebaseObject(sources: any): ISource[] {
    if (!Array.isArray(sources))
        return []

    return sources.map((source) => {
        return { name: source.name || "", url: source.url || "" }
    })
} // sourcesArrayToFirebaseObject


export async function downloadImgIntoArrayBuffer(fileUrl: string) {
    try {
        const response = await axios({
            url: fileUrl,
            responseType: "arraybuffer", // Ensures we get binary data
        })
        const fileBuffer = Buffer.from(response.data) // Convert to Buffer
        return {
            buffer: fileBuffer,
            fieldname: "image",
            encoding: "7bit",
            size: fileBuffer.length
        }
    } catch (error) {
        console.error(`Error downloading image file "${fileUrl}:`)
        return null
    }
} // downloadImgIntoArrayBuffer


/* upload to staging collection first to be reviewed by moderators. If IsPublished
 * is set to True - that means it can go directly to production.
 * return: collection - a firebase collection destination to wich an entry will be written to.
 *          id - an ID to use for the document name. For the "incoming" collection, use
 *              a generated UUID, so that it could be used by editHistory field to
 *              track which entry belong to which edits.
*/
function getStagingOrProdDb(item: IArchiveItem) {
    const id = item.id || generateFirestoreId()
    const collection = item.status === EItemStatus.published ? 
        doomPortsCollection : doomPortsIncomingCollection
    return { collection, id }
} // getStagingOrProdDb


async function createGithubIssue(items: IArchiveItem[]) {
    const token = process.env.GITHUB_TOKEN
    if (!token)
        return { url: null }
    
    // Remove fields that could potentially be considered sensitive to share publicly.
    items.forEach(i => {
        delete i.createdBy
        delete i.updatedBy
        delete i.submittedBy
    })
    const body = `\`\`\`\n${JSON.stringify({ items }, null, 2)}\n\`\`\``
    const title = `New Entry: ${items[0].title.slice(0, 30)}...`
    try {
        const response = await axios.post(
            "https://api.github.com/repos/zvolchak/can-it-run-doom/issues",
            {
                title,
                body,
                labels: ["new entry"],
                assignees: ["zvolchak"]
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github+json"
                }
            }
        )

        const batch = writeBatch(fbDb)
        const issueUrl = response?.data?.html_url
        // Update DB docs with the URL to the github issue it belongs to.
        await Promise.all(items.map(async (item) => { 
            const { collection, id } = getStagingOrProdDb(item)
            const docRef = doc(collection, id)
            await batch.update(docRef, { id: item.id, requestUrl: issueUrl })
        }))
        await batch.commit()

        return { url: issueUrl }
    } catch (error) {
        console.error(`Failed to create a Github Issue for entry ${items?.[0]?.id}:`, error)
        return { url: null }
    }
} // createGithubIssue


export async function createEntriesBatch(
    incomingEntry: IArchiveItem, 
    batch: WriteBatch, 
    incomingFile
): Promise<IEntryBatch> {
    // Handle URL previewImg by downloading the file and converting it into an array buffer.
    // if (!incomingFile && incomingEntry.previewImg?.startsWith("http")) {
    //     incomingFile = await downloadImgIntoArrayBuffer(incomingEntry.previewImg)
    // }
    incomingEntry.authors = sourcesArrayToFirebaseObject(incomingEntry?.authors)
    incomingEntry.sourcesUrl = sourcesArrayToFirebaseObject(incomingEntry.sourcesUrl)
    incomingEntry.sourceCodeUrl = sourcesArrayToFirebaseObject(incomingEntry.sourceCodeUrl)
    if (!incomingEntry.editHistory)
        incomingEntry.editHistory = []
    
    const { collection } = getStagingOrProdDb(incomingEntry)
    const entryId = incomingEntry.id || generateFirestoreId()
    let fileName = incomingFile?.originalname || incomingEntry.previewImg
    try {
        if (incomingFile?.buffer.length > 0) {
            const imageFileType = getFileType(incomingFile?.buffer)
            fileName = `${entryId}.${imageFileType}`
            fileName = await saveFileToStorage(fileName, incomingFile)
        }
    } catch (error) {
        console.error("Failed to add image: ", error.message)
        throw Error("Failed to process a preview image")
    }

    let docRef: DocumentReference<DocumentData, DocumentData> = null
    try {
        const newEntry: IArchiveItem = {
            ...incomingEntry,
            id: entryId,
            previewImg: fileName,
            submittedBy: null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }
        const docId = incomingEntry.status !== EItemStatus.pending ? entryId : generateFirestoreId()
        docRef = doc(collection, docId)
        // When id is set on the incoming entry - then it will be used as the final ID
        // of the entry when it is approved. Otherwise, an undefined value is set to the
        // entry that will break the batch.set operation. So need to clean it up.
        // if (newEntry.id === undefined || newEntry.id === null)
        //     delete newEntry.id

        await batch.set(docRef, newEntry)
        return { 
            batch,
            id: docId,
            entry: newEntry,  
            docRef, 
            file: { filename: fileName }
        }
    } catch (error) {
        console.error(error)
        throw Error("Failed to add entry")
    }
} // createEntriesBatch


export async function addEntries(
    items: IArchiveItem[], 
    user: DecodedIdToken,
    incomingFile
): Promise<IEntryAddedResponse> {
    const result = { success: [], failed: [] }
    const batch = writeBatch(fbDb)

    await Promise.all(items.map(async (entry: IArchiveItem) => {
        try {
            // const authorizedToPublish = IsAuthorized(user?.role, EUserRole.User)
            // if (entry.status !== null && !authorizedToPublish) {
            //     throw new Error("Not authorized to submit entries!")
            // }
            // If no status passed, then it is most likely a new entry submitted by a 
            // user for a review - so can assume "pending" status. Otherwise, probably
            // a moderator has reviewed and is updating the status of an entry.
            if (!entry.status)
                entry.status = EItemStatus.pending

            const toUpload = await createEntriesBatch(entry, batch, incomingFile)
            result.success.push(toUpload)
        } catch (error) {
            console.error("Failed to add an entry: ", error)
            result.failed.push(entry)
        }
    }))

    await batch.commit()
    return result
} // addEntries


router.post(
    "/add",  
    upload.single("image"), 
    async (req: Request, res: Response
): Promise<any> => {
    const errorMessage = "Failed to add a new entry! Please, try again or contact " +
        "support if the error persists." 

    try {
        const items: IArchiveItem[] = await buildArchiveItem(req.body?.items, req.user)
        const user = req.user

        if (!items || items.length === 0) 
            return res.status(400).json({ error: "Missing required fields!" })

        const result = await addEntries(items, user, req.file || null)

        if (result.success.length === 0) {
            return res.status(400).json({ 
                error: errorMessage
            })  
        }

        const statusCode = result.failed.length === 0 ? 201 : 206
        
        let githubIssue = null
        // Create a github issue in Prod env to track and notify about new submissions.
        if (process.env.NODE_ENV !== "development" && process.env.GITHUB_TOKEN) {
            githubIssue = await createGithubIssue(
                result.success.map(s => ({ ...s.entry, id: s.id }))
            )
        }

        const respData = { 
            message: "Entries added",
            success: result.success.map(s => s.id),
            failed: result.failed.map(f => f.id || f.title), 
            requestUrl: githubIssue?.url,
        }
        return res.status(statusCode).json(respData)
    } catch (error) {
        console.error("Failed to upload items", error)
        return res.status(400).json({ 
            error: errorMessage
        })
    }
})


export default router
