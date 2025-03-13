import { Request, Response, Router } from "express"
import {
    getAllDoomPorts,
 } from "../../utils/queries"

const router = Router()


router.get("/", async (req: Request, res: Response): Promise<any> => {
    try {
        const docRef = await getAllDoomPorts()
        const allTags = []

        docRef.forEach((doc) => {
          const data = doc.data()
          if (data.tags) {
            allTags.push(...data.tags)
          }
        })
    
        const uniqueTags = [...new Set(allTags)]

        res.status(200).json({ tags: uniqueTags })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to get tags" })
    }
})


export default router
