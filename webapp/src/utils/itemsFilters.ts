import dayjs from 'dayjs'
import type { IArchiveItem } from "@/src/types"
import { SortOption } from "../types/FiltersType"


export function flattenByTagAndSort(itemsToFilter: IArchiveItem[]): string[] {
    if (!itemsToFilter)
        return []

    const flattened = itemsToFilter.flatMap(item => item.tags)

    const frequency = flattened.reduce((map, tag) => {
        map.set(tag, (map.get(tag) || 0) + 1)
        return map
    }, new Map<string, number>())

    const sorted = Array.from(frequency.entries()).sort((a, b) => b[1] - a[1])

    return sorted.map(([tag]) => tag)
} // flattenAndSortTags


export function filterItemsByTags(itemsToFilter: IArchiveItem[], query: string[]) {
    if (!query || query.length == 0)
        return itemsToFilter

    return itemsToFilter.filter(item => {
        const hasExcludedTag = query.some(q =>
            q.startsWith('!') && (item.tags || []).includes(q.slice(1))
        )

        const hasIncludedTag = query.some(q =>
            !q.startsWith('!') && (item.tags || []).includes(q)
        )

        return !hasExcludedTag && hasIncludedTag
    })
} // filterItems


export function filterItemsByLvlCompleted(items: IArchiveItem[], state: boolean) {
    return items.filter((item: IArchiveItem) => item.isFirstLevelComplete === state)
} // filterItemsByLvlCompleted


export function filterItemsByAuthors(itemsToFilter: IArchiveItem[], query: string[]) {
    if (!query || query.length == 0)
        return itemsToFilter

    return itemsToFilter.filter(item =>
        (item.authors || []).some(author => query.includes(author?.name)))
}


export function getTagsFromItems(itemsToFilter: IArchiveItem[]): string[] {
    if (!itemsToFilter)
        return []

    const uniqueTags = Array.from(
        new Set(itemsToFilter.flatMap(item => item.tags || []).filter(tag => typeof tag === "string"))
    )
    return uniqueTags
} // tagsInFilteredItems


export function filterById(items: IArchiveItem[], ids: string[]) {
    return items.filter((item: IArchiveItem) => ids.indexOf(item.id) >= 0)
}


export function proxyToArray(target: any): any {
    // idk WTF this is and why. Cause Proxy... but still.
    const values = Object.values(JSON.parse(JSON.stringify(target)))
    // @ts-ignore
    return values.sort((a: any, b: any) =>
        dayjs(b.publishDate).isAfter(dayjs(a.publishDate))
    )
} // proxyToArray


export function proxyToObject(target: any): any {
    return JSON.parse(JSON.stringify(target))
} // proxyToObject


export function getAuthorsFromItems (items: IArchiveItem[]) {
    if (!items)
        return []

    return Array.from(new Set(items.flatMap(item => (item.authors || [])
        .map(author => author?.name).filter(name => typeof name === "string" && name.trim()))))
} // getAuthorsFromItems


export function getYearsFromItems(items: IArchiveItem[]) {
    return Array.from(
        new Set(items.filter(item => !!item.publishDate).map(
            item => new Date(item.publishDate).getUTCFullYear()).filter(Number.isFinite))
    ).reverse()
} // getYearsFromItems


export function findMinYear(archiveItems: IArchiveItem[]): number | null {
    if (archiveItems.length === 0) return null;

    return archiveItems.reduce((minYear, item) => {
        const itemYear = new Date(item.publishDate).getUTCFullYear();
        return itemYear < minYear ? itemYear : minYear;
    }, Infinity);
} // findMinYear


export function sortDscOrAsc(items: IArchiveItem[], order: string = "latest") {
    return [...items].sort(
        (a, b) => {
            const first = !order || order === SortOption.latest ? a : b
            const second = !order || order === SortOption.latest ? b : a
            return new Date(second.publishDate).getTime() - new Date(first.publishDate).getTime()
        }
    )
} // sortDscOrAsc


export function filterBySourceCode(items: IArchiveItem[], hasCode = true) {
    return items.filter((item: IArchiveItem) => {
        if (hasCode)
            return item.sourceCodeUrl?.length > 0
        else
            return !item.sourceCodeUrl || item.sourceCodeUrl.length == 0
    })
}


export function filterByAuthorsPerItem(items: IArchiveItem[], limit=1) {
    return items.filter((item: IArchiveItem) => {
        return item.authors?.length > 1 && item.authors.length <= limit
    })
}
