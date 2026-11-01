import type { ITag, TagCategory } from "../@types"

export const TAG_CATEGORY_ORDER: TagCategory[] = [
    "device",
    "system",
    "software",
    "engine",
    "technique",
    "input",
    "display",
]

/** Stored tags are documents keyed by tag id; the id is the document id, not a field. */
export function tagFromDocument(id: string, data: Partial<ITag>): ITag | null {
    if (!data?.label || !data?.category) return null
    return { id, label: data.label, category: data.category, ...(data.description ? { description: data.description } : {}) }
}

/** Group by category in a fixed order, then alphabetically by label. Unknown categories go last. */
export function sortTags(tags: ITag[]): ITag[] {
    const rank = (tag: ITag) => {
        const index = TAG_CATEGORY_ORDER.indexOf(tag.category)
        return index < 0 ? TAG_CATEGORY_ORDER.length : index
    }
    return [...tags].sort((a, b) => rank(a) - rank(b) || a.label.localeCompare(b.label))
}
