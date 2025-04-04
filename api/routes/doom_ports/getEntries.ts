import { Request, Response, Router } from 'express'
import dayjs from "dayjs"
import {
    EUserRole,
    getImageFromStorage,
    getEntriesByStatus,
    getUserFromRequest,
    statusStringToEnum,
} from "../../utils"
import { EItemStatus } from '@/@types'


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
    let { perPage = 200 , page = 1, ids = "", status = "" } = req.query

    // Make sure only status times from the enum are passed by the client. If not, can
    // assume a "published" status, since it is a default, publically accessible status.
    const targetStatus = statusStringToEnum(status as string)

    const user = getUserFromRequest(req)
    if (targetStatus !== EItemStatus.published && user?.role !== EUserRole.Owner) {
        return res.status(403).json({ error: "Not authorized to query by status!" })
    }

    perPage = parseInt(perPage as string, 10)
    page = parseInt(page as string, 10)
    ids = ((ids as string).split(",") || []).filter(id => id)

    try {
        const snapshot = await getEntriesByStatus({ 
            status: targetStatus, 
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
