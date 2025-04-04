import { Request, Response, Router } from "express"
import { IArchiveItem } from "../../@types"
import {
    updateDoomPort,
    UserRole,
 } from "../../utils"
 import {
    authenticate,
    authorizeByRole,
 } from "../../middleware"

const router = Router()

const ALLOWED_KEYS = [
    "title", "description", "authors", "isFirstLevelComplete", "previewImg", 
    "publishDate", "sourceCodeUrl", "sourcesUrl", "tags", "isPublished"
]


router.patch(
    "/:id", 
    authenticate, 
    (req: Request, res: Response, next) => authorizeByRole(req, res, UserRole.Moderator, next),
    async (req: Request, res: Response
): Promise<any> => {
    const { id } = req.params
    const newEntry = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => ALLOWED_KEYS.includes(key))
    ) as Partial<IArchiveItem>

    const user = req.user

    if (newEntry?.hasOwnProperty("isPublished") && user.role !== UserRole.Owner) {
        return res.status(403).json({ 
            error: "Not authorized to modify publish state of an entry!" 
        })
    }

    if (newEntry.submittedBy !== user.uid && user.role !== UserRole.Owner) {
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
