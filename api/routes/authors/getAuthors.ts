import { Request, Response, Router } from "express"
import {
    getAllAuthors,
 } from "../../utils/queries"

const router = Router()


router.get("/", async (req: Request, res: Response): Promise<any> => {
    try {
        const docRef = await getAllAuthors()
        const authors = []

        docRef.forEach((doc) => {
          const data = doc.data()
          if (data.name) {
            authors.push({ name: data.name, links: data.links })
          }
        })
    
        const uniqueAuthors = []
        const uniqueNames = new Set()
    
        authors.forEach((author) => {
          if (!uniqueNames.has(author.name)) {
            uniqueNames.add(author.name)
            uniqueAuthors.push(author)
          }
        })

        return res.status(200).json({ authors: uniqueAuthors })
    } catch(error) {
        console.error(error)
        res.status(500).json({ error: "Failed to get authors" })
    }
}) // add


export default router
