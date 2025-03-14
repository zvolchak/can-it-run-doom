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
    ISource,
} from "../../@types"
import {
    fbStorage,
    buildArchiveItem,
    fbDb,
    doomPortsCollection,
    generateFirestoreId,
    UserRole,
    IsAuthorized,
 } from "../../utils"
 import {
    authenticate,
    authorizeByRole,
 } from "../../middleware"


const router = Router()
const upload = multer({ storage: multer.memoryStorage() })


async function saveFileToStorage(fileName: string, file) {
    const storageFile = fbStorage.file(fileName)
    await storageFile.save(file.buffer, {
        metadata: { contentType: file.mimetype }
    })
    await storageFile.makePublic()
    const bucket_name = process.env.FB_STORAGE_BUCKET
    const base_url = process.env.FB_STORAGE_BASE_URL
    const public_url = `${base_url}/v0/b/${bucket_name}/o/doom-preview-images%2F${fileName}`
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
}


async function addEntry(incomingEntry: IArchiveItem, batch: WriteBatch, incomingFile) {
    // Handle URL previewImg by downloading the file and converting it into an array buffer.
    // if (!incomingFile && incomingEntry.previewImg?.startsWith("http")) {
    //     incomingFile = await downloadImgIntoArrayBuffer(incomingEntry.previewImg)
    // }
    
    incomingEntry.authors = sourcesArrayToFirebaseObject(incomingEntry?.authors)
    incomingEntry.sourcesUrl = sourcesArrayToFirebaseObject(incomingEntry.sourcesUrl)
    incomingEntry.sourceCodeUrl = sourcesArrayToFirebaseObject(incomingEntry.sourceCodeUrl)

    const id = incomingEntry.id || generateFirestoreId()
    let fileName = incomingEntry.previewImg
    try {
        if (incomingFile?.buffer.length > 0) {
            const imageFileType = getFileType(incomingFile?.buffer)
            fileName = `${id}.${imageFileType}`
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
            previewImg: fileName,
            submittedBy: null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }

        // Some legacy entries my have ID supplied - so remove it and use doc's id instead.
        delete newEntry[id]

        docRef = doc(doomPortsCollection, id)
        await batch.set(docRef, newEntry)
    } catch (error) {
        console.error(error)
        throw Error("Failed to add entry")
    }

    return { batch, docRef, file: { ...incomingFile, filename: fileName }}
}


router.post(
    "/add", 
    authenticate,
    (req: Request, res: Response, next) => authorizeByRole(req, res, UserRole.User, next),
    upload.single("image"), 
    async (req: Request, res: Response): Promise<any> => 
{
    const items: IArchiveItem[] = await buildArchiveItem(req.body, req.user)
    const user = req.user

    if (!items || items.length === 0) 
        return res.status(400).json({ error: "Missing body content" })

    const result = { success: [], failed: [] }
    try {
        const batch = writeBatch(fbDb)
        const authorizedToPublish = IsAuthorized(user?.role, UserRole.Moderator)

        await Promise.all(items.map(async (entry: IArchiveItem) => {
            try {
                // Only Moderator+ type user can add an entry to publish directly. Otherwise,
                // an entry needs to be reviewed by a Moderator and published manually.
                if (entry.isPublished && !authorizedToPublish) {
                    throw new Error("Not authorized to publish!")
                }

                const toUpload = await addEntry(entry, batch, null)
                result.success.push(toUpload.docRef.id)
            } catch (error) {
                console.error("Failed to add an entry: ", error)
                result.failed.push(entry.id || entry.title)
            }
        }))

        await batch.commit()

        return res.status(201).json({ 
            message: "Entries added",
            ...result, 
         })
    } catch (error) {
        console.error("Failed to upload items", error)
        return res.status(400).json({ error: "Faild to upload bulk entries" })
    }
})


export default router
