import type { IArchiveItem } from "../types/ItemEntryType"
import { slugify } from "./projectSlug"

/** Tags with fewer projects would make thin pages, so they get none. */
export const TAG_PAGE_MIN_PROJECTS = 3

export interface TagPage {
    slug: string
    label: string
    /** Every stored spelling that maps to this page. */
    values: string[]
    count: number
}

export function tagPath(slug: string): string {
    return `/tags/${encodeURIComponent(slug)}`
}

/** "mp3 player" and "classic-doom" read the same way as page labels. */
export function tagLabel(value: string): string {
    const text = value.trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ")
    return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Group stored tags by URL slug. Spelling variants share one page. */
export function tagPages(items: IArchiveItem[], minimum = TAG_PAGE_MIN_PROJECTS): Map<string, TagPage> {
    const groups = new Map<string, { values: Map<string, number>, ids: Set<number> }>()
    items.forEach((item, index) => {
        for (const value of new Set((item.tags || []).filter((tag): tag is string => typeof tag === "string"))) {
            const slug = slugify(value)
            if (!slug) continue
            const group = groups.get(slug) || { values: new Map(), ids: new Set() }
            group.values.set(value, (group.values.get(value) || 0) + 1)
            group.ids.add(index)
            groups.set(slug, group)
        }
    })
    const pages = new Map<string, TagPage>()
    for (const [slug, group] of groups) {
        if (group.ids.size < minimum) continue
        const values = [...group.values].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([value]) => value)
        pages.set(slug, { slug, label: tagLabel(values[0]), values, count: group.ids.size })
    }
    return pages
}
