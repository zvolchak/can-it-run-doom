import { Request, Response, Router } from "express"
import { getAllTags } from "../../utils/queries"
import { sortTags, tagFromDocument } from "../../utils/tags"

const router = Router()


router.get("/", async (req: Request, res: Response): Promise<any> => {
    try {
        const snapshot = await getAllTags()
        const tags = snapshot.docs
            .map((doc) => tagFromDocument(doc.id, doc.data()))
            .filter((tag) => tag !== null)

        res.status(200).json({ tags: sortTags(tags) })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to get tags" })
    }
})


export default router
