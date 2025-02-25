import { Request, Response, Router } from "express"
import multer from "multer"
import { v4 as uuidv4 } from "uuid"
import filetype from 'magic-bytes.js'
import { 
    Timestamp, 
} from "firebase/firestore"
import { IArchiveItem, ISource } from "../../@types"
import {
    authenticate,
    addDoomPort,
    fbStorage,
    buildArchiveItem,
 } from "../../utils"

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })


async function saveFileToStorage(fileName: string, file) {
    const storageFile = fbStorage.file(fileName)
    await storageFile.save(file.buffer, {
        metadata: { contentType: file.mimetype }
    })
} // saveFileToStorage


function getFileType(req: Request) {
    const incomingFile = (req as any).file
    if (!incomingFile)
        return null
    const bytes = Array.from(incomingFile.buffer).slice(0, 12) as any
    const detectedMimeType = filetype(bytes)

    if (detectedMimeType?.length === 0)
        return null

    const mime = detectedMimeType[0].mime
    if (!mime.toLocaleLowerCase().startsWith("image"))
        throw Error("Only image files are supported!")

    return detectedMimeType[0].typename
} // getFileType


function sourcesArrayToFirebaseObject(sources: any) {
    return sources.map(([name, url]) => ({ name, url }))
}


router.post(
    "/add", 
    authenticate, 
    upload.single("image"), 
    async (req: Request, res: Response): Promise<any> => 
{
    const incomingEntry: IArchiveItem = buildArchiveItem(req.body)
    const incomingFile = (req as any).file

    incomingEntry.authors = sourcesArrayToFirebaseObject(incomingEntry.authors)
    incomingEntry.sourcesUrl = sourcesArrayToFirebaseObject(incomingEntry.sourcesUrl)
    incomingEntry.sourceCodeUrl = sourcesArrayToFirebaseObject(incomingEntry.sourceCodeUrl)

    const id = incomingEntry.id || uuidv4()
    let fileName = null
    try {
        if (incomingFile?.buffer.length > 0 && !incomingFile.previewImg) {
            const imageFileType = getFileType(req)
            fileName = `doom-preview-images/${id}.${imageFileType}`
            await saveFileToStorage(fileName, incomingFile)
        }
    } catch (error) {
        console.error("Failed to add image", error.message)
        return res.status(400).json({ error: error.message })
    }

    try {
        const newEntry: IArchiveItem = {
            ...incomingEntry,
            previewImg: fileName,
            submittedBy: null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }

        const docRef = await addDoomPort(newEntry)

        res.status(201).json({ 
            message: "Entry added successfully", 
            entry: docRef, 
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to add entry" })
    }
})


export default router
