import { Request, Response, Router } from 'express'
import dayjs from "dayjs"
import {
    getAllEntries,
    getImageFromStorage,
} from "../../utils"


const router = Router()


router.get('/', async (req: Request, res: Response): Promise<any> => {
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600")
    
    try {
        const snapshot = await getAllEntries()
        
        const entries = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data()
            const rawDate = data.publishDate?.toDate()
            const previewImg = await getImageFromStorage(data.previewImg)
            const publishDate = rawDate ? dayjs(rawDate).format("MMMM D, YYYY") : null
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

        entries.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
        return res.status(200).json(entries)
    } catch (error) {
        console.error("Error fetching entries:", error)
        return res.status(500).json({ error: "Failed to retrieve entries" })
    }
})


export default router
