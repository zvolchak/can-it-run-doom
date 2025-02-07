import { Request, Response, Router } from "express"
import { Timestamp } from "firebase/firestore"
import { IArchiveItem } from "../../types"
import {
    addDoomPort,
 } from "../../utils/queries"

const router = Router()


router.post("/add", async (req: Request, res: Response): Promise<any> => {
    const newEntry: IArchiveItem = req.body[0]

    if (!newEntry.title || !newEntry.description) {
        return res.status(400).json({ error: "Missing required fields" })
    }

    try {
        const docRef = await addDoomPort({
            ...newEntry,
            isPublished: false,
            submittedBy: "",
            createdAt: Timestamp.now(), // UTC timezone
            updatedAt: Timestamp.now(), // UTC timezone
        })
        res.status(201).json({ message: "Entry added successfully", entry: docRef })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to add entry" })
    }
})


export default router
