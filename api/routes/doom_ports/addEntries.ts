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
import { IArchiveItem, ISource } from "../../@types"
import {
    authenticate,
    addDoomPort,
    fbStorage,
    buildArchiveItem,
    fbDb,
    doomPortsCollection,
    generateFirestoreId,
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


async function addEntry(incomingEntry: IArchiveItem, batch: WriteBatch, incomingFile) {
    // Handle URL previewImg by downloading the file and converting it into an array buffer.
    if (!incomingFile && incomingEntry.previewImg?.startsWith("http")) {
        incomingFile = await downloadImgIntoArrayBuffer(incomingEntry.previewImg)
    }
    
    incomingEntry.authors = sourcesArrayToFirebaseObject(incomingEntry?.authors)
    incomingEntry.sourcesUrl = sourcesArrayToFirebaseObject(incomingEntry.sourcesUrl)
    incomingEntry.sourceCodeUrl = sourcesArrayToFirebaseObject(incomingEntry.sourceCodeUrl)

    const id = incomingEntry.id || generateFirestoreId()
    let fileName = null
    try {
        if (incomingFile?.buffer.length > 0) {
            const imageFileType = getFileType(incomingFile?.buffer)
            fileName = `doom-preview-images/${id}.${imageFileType}`
            await saveFileToStorage(fileName, incomingFile)
        }
    } catch (error) {
        console.error("Failed to add image", error.message)
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
    upload.single("image"), 
    async (req: Request, res: Response): Promise<any> => 
{
    const items: IArchiveItem[] = await buildArchiveItem(req.body)

    if (!items || items.length === 0) 
        return res.status(400).json({ error: "Missing body content" })

    try {
        const batch = writeBatch(fbDb)

        const toUpload = await Promise.all(items.map(async (entry: IArchiveItem) => {
            const toUpload = await addEntry(entry, batch, null)
            return toUpload
        }))

        const uploadedIds = await Promise.all(toUpload.map(async (toUpload) => {
            return toUpload.docRef.id
        }))
        
        await batch.commit()

        return res.status(201).json({ 
            message: "Bulk Entries added",
            ids: uploadedIds, 
         })
    } catch (error) {
        console.error("Failed to upload bulk items", error)
        return res.status(400).json({ error: "Faild to upload bulk entries" })
    }
})


// router.post(
//     "/add", 
//     authenticate, 
//     upload.single("image"), 
//     async (req: Request, res: Response): Promise<any> => 
// {
//     const items: IArchiveItem[] = await buildArchiveItem([req.body])
//     const incomingEntry: IArchiveItem = items[0] || null
//     if (!incomingEntry)
//         return res.status(400).json({ error: "Missing body content" })

//     let incomingFile = (req as any).file

//     // Handle URL previewImg by downloading the file and converting it into an array buffer.
//     if (!incomingFile && incomingEntry.previewImg?.startsWith("http")) {
//         incomingFile = await downloadImgIntoArrayBuffer(incomingEntry.previewImg)
//     }
    
//     incomingEntry.authors = sourcesArrayToFirebaseObject(incomingEntry?.authors)
//     incomingEntry.sourcesUrl = sourcesArrayToFirebaseObject(incomingEntry.sourcesUrl)
//     incomingEntry.sourceCodeUrl = sourcesArrayToFirebaseObject(incomingEntry.sourceCodeUrl)

//     const id = incomingEntry.id || generateFirestoreId()
//     let fileName = null
//     try {
//         if (incomingFile?.buffer.length > 0) {
//             const imageFileType = getFileType(incomingFile?.buffer)
//             fileName = `doom-preview-images/${id}.${imageFileType}`
//             await saveFileToStorage(fileName, incomingFile)
//         }
//     } catch (error) {
//         console.error("Failed to add image", error.message)
//         return res.status(400).json({ error: "Failed to process a preview image" })
//     }

//     try {
//         const newEntry: IArchiveItem = {
//             ...incomingEntry,
//             previewImg: fileName,
//             submittedBy: null,
//             createdAt: Timestamp.now(),
//             updatedAt: Timestamp.now(),
//         }

//         const docRef = await addDoomPort(newEntry) as DocumentReference<DocumentData, DocumentData>

//         res.status(201).json({ 
//             message: "Entry added", 
//             entry: { ...newEntry, id: docRef.id }, 
//         })
//     } catch (error) {
//         console.error(error)
//         res.status(500).json({ error: "Failed to add entry" })
//     }
// })


export default router
