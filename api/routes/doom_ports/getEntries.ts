import { Request, Response, Router } from 'express'
import dayjs from "dayjs"
import {
    getAllEntries,
    getImageFromStorage,
} from "../../utils"


const router = Router()


router.get('/', async (req: Request, res: Response): Promise<any> => {
    try {
        const snapshot = await getAllEntries()
        
        const entries = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data()
            const previewImg = await getImageFromStorage(data.previewImg)
            const publishDate = data.publishDate?.toDate() ? dayjs().format("MMMM D, YYYY") : null
            const result =  { 
                id: doc.id, 
                ...data,
                previewImg,
                publishDate,
                createdAt: data.createdAt?.toDate() || null,
                updatedAt: data.updatedAt?.toDate() || null,
            }
            return result
        }))
        return res.status(200).json(entries)
    } catch (error) {
        console.error("Error fetching entries:", error)
        return res.status(500).json({ error: "Failed to retrieve entries" })
    }
})


export default router
