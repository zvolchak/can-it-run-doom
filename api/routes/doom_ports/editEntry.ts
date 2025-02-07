import { Request, Response, Router } from "express"
import { IArchiveItem } from "../../types"
import {
    updateDoomPort
 } from "../../utils/queries"

const router = Router()


router.patch("/:id", async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params
    const newEntry: IArchiveItem = req.body

    try {
        const docRef = await updateDoomPort(
            id,
            {
                ...newEntry,
            }
        )
        res.status(201).json({ message: "Entry updated successfully", entry: docRef })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to update entry" })
    }
})


export default router
