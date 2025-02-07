import { Request, Response, Router, } from "express"
import { IAuthorDocument, } from "../../types"
import {
    updateAuthor,
 } from "../../utils/queries"

const router = Router()


router.patch("/:id", async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params
    const newEntry: IAuthorDocument = req.body

    try {
        const docRef = await updateAuthor(
            id,
            {
                ...newEntry,
            }
        )
        res.status(201).json({ message: "Author updated successfully", entry: docRef })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to updated author" })
    }
})


export default router
