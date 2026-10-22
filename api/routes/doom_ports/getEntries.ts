import { Request, Response, Router } from 'express'
import dayjs from "dayjs"
import {
    EUserRole,
    getPublishedEntriesPage,
    getEntriesByStatus,
    getUserFromRequest,
    statusStringToEnum,
    IsAuthorized,
} from "../../utils"
import { additionIso } from "../../utils/publication"
import { EItemStatus } from '../../@types'


const router = Router()



router.get('/', async (req: Request, res: Response): Promise<any> => {
    res.setHeader("Cache-Control", "no-store")
    const { perPage: rawPerPage = 200, ids: rawIds = "", status = "" } = req.query

    // Make sure only status times from the enum are passed by the client. If not, can
    // assume a "published" status, since it is a default, publically accessible status.
    const targetStatus = statusStringToEnum(status as string)

    const user = getUserFromRequest(req)

    if (targetStatus !== EItemStatus.published &&
        !IsAuthorized(user?.role, EUserRole.Moderator)) {
        return res.status(403).json({ error: "Not authorized to query by status!" })
    }

    const perPage = parseInt(rawPerPage as string, 10)
    const ids = String(rawIds).split(",").filter(Boolean)

    const cursorMode = req.query.pagination === "cursor"
    if (cursorMode && (targetStatus !== EItemStatus.published || ids.length))
        return res.status(400).json({ error: "Cursor pagination supports the full published archive only" })
    if (!Number.isInteger(perPage) || perPage < 1 || (cursorMode && perPage > 200))
        return res.status(400).json({ error: "perPage must be a positive integer (at most 200 in cursor mode)" })
    const cursor = req.query.cursor
    if (cursor !== undefined && (typeof cursor !== "string" || !cursor || cursor.includes("/") || cursor.length > 1500))
        return res.status(400).json({ error: "Invalid cursor" })

    try {
        const snapshot = cursorMode ? await getPublishedEntriesPage(perPage, cursor as string) : await getEntriesByStatus({
            status: targetStatus,
            ids,
            limit: perPage
        })
        const documents = cursorMode ? snapshot.docs.slice(0, perPage) : snapshot.docs
        const entries = await Promise.all(documents.map(async doc => {
            const data = doc.data()
            const rawDate = data.publishDate?.toDate?.()
            // const previewImg = await getImageFromStorage(data.previewImg)
            const publishDate = rawDate ? dayjs(rawDate).format("MMMM D, YYYY") : null
            const result: Record<string, any> = {
                ...data,
                id: doc.id,
                publishDate,
                createdAt: data.createdAt?.toDate() || null,
                updatedAt: data.updatedAt?.toDate() || null,
                addedAt: additionIso(data.addedAt),
            }
            delete result.publicationState
            return result
        }))

        if (!cursorMode) entries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

        return res.status(200).json({
            items: entries,
            ...(cursorMode ? { pagination: { nextCursor: snapshot.docs.length > perPage ? documents[documents.length - 1].id : null } } : {}),
        })
    } catch (error) {
        console.error("Error fetching entries:", error)
        return res.status(500).json({ error: "Failed to retrieve entries" })
    }
})


export default router
