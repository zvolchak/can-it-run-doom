import { Request, Response, Router } from "express"
import { IArchiveItem } from "../../@types"
import {
    updateDoomPort,
    EUserRole,
 } from "../../utils"
 import {
    authenticate,
    authorizeByRole,
 } from "../../middleware"

const router = Router()

const ALLOWED_KEYS = [
    "title", "description", "authors", "isFirstLevelComplete", "previewImg", 
    "publishDate", "sourceCodeUrl", "sourcesUrl", "tags", "status"
]


router.patch(
    "/:id", 
    authenticate, 
    (req: Request, res: Response, next) => authorizeByRole(req, res, EUserRole.User, next),
    async (req: Request, res: Response
): Promise<any> => {
    const { id } = req.params
    const newEntry = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => ALLOWED_KEYS.includes(key))
    ) as Partial<IArchiveItem>

    const user = req.user

    if (newEntry?.hasOwnProperty("status") && user.role !== EUserRole.Owner) {
        return res.status(403).json({ 
            error: "Not authorized to modify status of an entry!" 
        })
    }

    if (newEntry.submittedBy !== user.uid && user.role !== EUserRole.Owner) {
        return res.status(403).json({ error: "Not authorized to edit someone's entry!" })
    }

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
