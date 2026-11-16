import type { ServerResponse } from "http"
import type { IArchiveItem } from "@/src/types"
import { fetchDoomPorts } from "@/src/api"

/** Published entries with storage-relative preview paths made absolute. A failed
 * fetch answers 503 so crawlers never mistake an outage for an empty archive. */
export async function loadArchive(res: ServerResponse): Promise<{ items: IArchiveItem[], failed: boolean }> {
    // Do not serve server-rendered badges across their exact expiry boundaries.
    res.setHeader("Cache-Control", "no-store")
    const fetched = await fetchDoomPorts()
    if (!fetched) {
        res.statusCode = 503
        res.setHeader("Retry-After", "300")
    }
    const storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace(/\/$/, "")
    const items = (fetched || []).map((item: IArchiveItem) => ({
        ...item,
        previewImg: item.previewImg && !item.previewImg.startsWith("http") && storageBaseUrl
            ? `${storageBaseUrl}/${item.previewImg.replace(/^\//, "")}` : item.previewImg || null,
    }))
    return { items, failed: !fetched }
}
