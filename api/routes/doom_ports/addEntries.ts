import { Request, Response, Router } from "express"
import axios from "axios"
import multer from "multer"
import { v4 as uuidv4 } from "uuid"
import filetype from 'magic-bytes.js'
import { 
    Timestamp,
    writeBatch,
    doc,
    DocumentReference,
    DocumentData,
} from "firebase/firestore"
import { IArchiveItem, ISource } from "../../@types"
import {
    authenticate,
    addDoomPort,
    fbStorage,
    buildArchiveItem,
    fbDb,
    doomPortsCollection,
 } from "../../utils"

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })


async function saveFileToStorage(fileName: string, file) {
    const storageFile = fbStorage.file(fileName)
    await storageFile.save(file.buffer, {
        metadata: { contentType: file.mimetype }
    })
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


export async function addDoomPortsBatch(entries: IArchiveItem[]) {
    if (!entries || entries.length === 0) return

    const batch = writeBatch(fbDb)

    await Promise.all(entries.map(async (entry: IArchiveItem) => {
        const id = entry.id || uuidv4()
        const docRef = doc(doomPortsCollection, id)

        const incomingEntry = { ...entry } as IArchiveItem
        incomingEntry.authors = sourcesArrayToFirebaseObject(incomingEntry.authors)
        incomingEntry.sourcesUrl = sourcesArrayToFirebaseObject(incomingEntry.sourcesUrl)
        incomingEntry.sourceCodeUrl = sourcesArrayToFirebaseObject(incomingEntry.sourceCodeUrl)
        incomingEntry.createdAt = Timestamp.now()
        incomingEntry.updatedAt = incomingEntry.createdAt

        batch.set(docRef, incomingEntry)
        return docRef.id // Track successful writes
    }))

    await batch.commit()
} // addDoomPortsBatch


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
        console.error(`Error downloading image file "${fileUrl}:`, error)
        throw new Error("File upload failed")
    }
}


router.post(
    "/add", 
    authenticate, 
    upload.single("image"), 
    async (req: Request, res: Response): Promise<any> => 
{
    const items: IArchiveItem[] = await buildArchiveItem([req.body])
    const incomingEntry: IArchiveItem = items[0] || null
    if (!incomingEntry)
        return res.status(400).json({ error: "Missing body content" })

    let incomingFile = (req as any).file

    // Handle URL previewImg by downloading the file and converting it into an array buffer.
    if (!incomingFile && incomingEntry.previewImg?.startsWith("http")) {
        incomingFile = await downloadImgIntoArrayBuffer(incomingEntry.previewImg)
    }
    
    incomingEntry.authors = sourcesArrayToFirebaseObject(incomingEntry?.authors)
    incomingEntry.sourcesUrl = sourcesArrayToFirebaseObject(incomingEntry.sourcesUrl)
    incomingEntry.sourceCodeUrl = sourcesArrayToFirebaseObject(incomingEntry.sourceCodeUrl)

    const id = incomingEntry.id || uuidv4()
    let fileName = null
    try {
        if (incomingFile?.buffer.length > 0) {
            const imageFileType = getFileType(incomingFile?.buffer)
            fileName = `doom-preview-images/${id}.${imageFileType}`
            await saveFileToStorage(fileName, incomingFile)
        }
    } catch (error) {
        console.error("Failed to add image", error.message)
        return res.status(400).json({ error: "Failed to process a preview image" })
    }

    try {
        const newEntry: IArchiveItem = {
            ...incomingEntry,
            previewImg: fileName,
            submittedBy: null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }

        const docRef = await addDoomPort(newEntry) as DocumentReference<DocumentData, DocumentData>

        res.status(201).json({ 
            message: "Entry added successfully", 
            entry: { ...newEntry, id: docRef.id }, 
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to add entry" })
    }
})


export default router
