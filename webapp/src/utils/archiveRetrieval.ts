import type { IArchiveItem } from "@/src/types"
import { normalizeAddition } from "./additionDates"

type ArchivePage = { items: IArchiveItem[], pagination: { nextCursor: string | null } }

/** Fail closed: a failed/malformed/stalled page never becomes a partial archive. */
export async function retrievePublishedArchive(fetchPage: (cursor?: string) => Promise<ArchivePage>): Promise<IArchiveItem[]> {
    const items = new Map<string, IArchiveItem>()
    const cursors = new Set<string>()
    let cursor: string | undefined
    do {
        const page = await fetchPage(cursor)
        if (!Array.isArray(page?.items) || !page.pagination || !(page.pagination.nextCursor === null || typeof page.pagination.nextCursor === "string"))
            throw new Error("Incomplete archive pagination response")
        const previousSize = items.size
        for (const item of page.items) {
            if (!item || typeof item.id !== "string" || !item.id) throw new Error("Archive entry has no ID")
            items.set(item.id, { ...item, addedAt: normalizeAddition(item.addedAt), createdAt: normalizeAddition(item.createdAt) })
        }
        const next = page.pagination.nextCursor
        if (next === null) break
        if (!next || cursors.has(next) || items.size === previousSize) throw new Error("Archive pagination stalled")
        cursors.add(next)
        cursor = next
    } while (cursor)
    // Preserve the historical default ordering after fetching in document-ID order.
    return [...items.values()].sort((a, b) => {
        const time = (value: unknown) => typeof value === "string" ? Date.parse(value) || 0 : 0
        return time((b as IArchiveItem & { updatedAt?: string }).updatedAt) - time((a as IArchiveItem & { updatedAt?: string }).updatedAt)
            || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    })
}
