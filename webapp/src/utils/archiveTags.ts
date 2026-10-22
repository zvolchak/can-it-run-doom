import type { IArchiveItem } from "../types"

/** Count distinct projects, retaining exact stored values for filter shortcuts. */
export function archiveTagUsage(items: IArchiveItem[]): Map<string, number> {
    const usage = new Map<string, number>()
    for (const item of items) for (const tag of new Set(item.tags || [])) {
        if (typeof tag === "string" && tag.trim()) usage.set(tag, (usage.get(tag) || 0) + 1)
    }
    return usage
}

export function topProjectTags(tags: string[] | null | undefined, usage: ReadonlyMap<string, number>): string[] {
    return [...new Set(tags || [])].filter(tag => typeof tag === "string" && tag.trim())
        .sort((a, b) => (usage.get(b) || 0) - (usage.get(a) || 0) || a.localeCompare(b)).slice(0, 5)
}
