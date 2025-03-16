import { Request, Response, Router } from 'express'
import dayjs from "dayjs"
import {
    getImageFromStorage,
    getPublishedEntries,
} from "../../utils"


const router = Router()


function paginateList(items: any[], page: number, limit: number): any[] {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    return items.slice(startIndex, endIndex)
} // paginateList


router.get('/', async (req: Request, res: Response): Promise<any> => {
    // 5 minutes cache
    const cacheTime = 60 * 5
    res.setHeader("Cache-Control", `public, max-age=${cacheTime}, stale-while-revalidate=600`)
    let { perPage = 200 , page = 1, ids = ""} = req.query
    perPage = parseInt(perPage as string, 10)
    page = parseInt(page as string, 10)
    ids = ((ids as string).split(",") || []).filter(id => id)

    try {
        // Only get entries that are isPublished = true
        const snapshot = await getPublishedEntries({ 
            isPublished: true, 
            ids, 
            limit: perPage 
        })

        let entries = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data()
            const rawDate = data.publishDate?.toDate()
            // const previewImg = await getImageFromStorage(data.previewImg)
            const publishDate = rawDate ? dayjs(rawDate).format("MMMM D, YYYY") : null
            const result =  { 
                id: doc.id, 
                ...data,
                publishDate,
                createdAt: data.createdAt?.toDate() || null,
                updatedAt: data.updatedAt?.toDate() || null,
            }
            return result
        }))

        entries.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())

        return res.status(200).json({ 
            items: entries, 
        })
    } catch (error) {
        console.error("Error fetching entries:", error)
        return res.status(500).json({ error: "Failed to retrieve entries" })
    }
})


export default router
