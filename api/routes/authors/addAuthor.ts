import { Request, Response, Router } from "express"
import { IAuthorDocument } from "../../@types"
import {
    getAuthorsByName,
    addAuthor,
 } from "../../utils/queries"

const router = Router()


router.post("/add", async (req: Request, res: Response): Promise<any> => {
    const newEntry: IAuthorDocument = req.body[0]

    if (!newEntry.name || newEntry.links === null) {
        return res.status(400).json({ error: "Missing required fields." })
    }

    const existingAuthor = await getAuthorsByName(newEntry.name)
    if (existingAuthor && existingAuthor.size > 0)
        return res.status(409).json({ error: "This author already in the database."})

    const addedAuthor = await addAuthor(newEntry)

    return res.status(201).json({ message: "New author has been added.", id: addedAuthor.id })
}) // add


export default router
