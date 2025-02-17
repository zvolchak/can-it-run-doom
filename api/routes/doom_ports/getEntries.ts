import { Request, Response, Router } from 'express'
import {
    getAllEntries,
} from "../../utils"


const router = Router()


router.get('/', async (req: Request, res: Response): Promise<any> => {
    try {
        const snapshot = await getAllEntries()
        const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        return res.status(200).json(entries)
    } catch (error) {
        console.error("Error fetching entries:", error)
        return res.status(500).json({ error: "Failed to retrieve entries" })
    }
})


export default router
