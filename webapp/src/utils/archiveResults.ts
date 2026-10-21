import type { IArchiveItem, IFiltersStoreState } from "@/src/types"
import {
    onSearch, filterById, filterItemsByTags, filterItemsByAuthors, sortDscOrAsc,
    filterItemsByLvlCompleted, filterBySourceCode, filterByAuthorsPerItem,
} from "./itemsFilters"

export function filterBoolean(value: unknown): boolean | null {
    if (value === null || value === undefined || value === "") return null
    return value === true || String(value).toLowerCase() === "true"
}

function positiveNumber(value: unknown): number | null {
    const number = Number(value)
    return Number.isInteger(number) && number > 0 ? number : null
}

export function archiveResults(items: IArchiveItem[], filters: IFiltersStoreState, pageSize = 10) {
    let matches = [...items]
    const options = filters.query || {}
    const completed = filterBoolean(options.levelCompleted)
    const hasCode = filterBoolean(options.hasCode)
    if (completed !== null) matches = filterItemsByLvlCompleted(matches, completed)
    if (filters.searchString?.trim()) matches = onSearch(matches, filters.searchString.trim())
    if (filters.authors?.length) matches = filterItemsByAuthors(matches, filters.authors)
    if (filters.ids?.length) matches = filterById(matches, filters.ids)
    if (filters.tags?.length) matches = filterItemsByTags(matches, filters.tags)
    const authorLimit = positiveNumber(options.authorsPerItem)
    if (authorLimit) matches = filterByAuthorsPerItem(matches, authorLimit)
    if (hasCode !== null) matches = filterBySourceCode(matches, hasCode)

    if (filters.years?.start || filters.years?.end) {
        const start = Number(filters.years.start) || -Infinity
        const end = Number(filters.years.end) || Infinity
        matches = matches.filter(item => {
            if (!item.publishDate) return false
            const year = new Date(item.publishDate).getUTCFullYear()
            return year >= start && year <= end
        })
    }
    if (options.sort) matches = sortDscOrAsc(matches, options.sort)
    const limit = positiveNumber(options.limit)
    if (limit) matches = matches.slice(0, limit)

    const total = matches.length
    const numberOfPages = Math.ceil(total / pageSize)
    const page = Math.min(positiveNumber(filters.page) || 1, Math.max(1, numberOfPages))
    const offset = (page - 1) * pageSize
    return {
        matches, total, numberOfPages, page,
        pageItems: matches.slice(offset, offset + pageSize),
        first: total ? offset + 1 : 0,
        last: Math.min(total, offset + pageSize),
    }
}

export function paginationPages(page: number, count: number): (number | "ellipsis")[] {
    if (count < 1) return []
    const visible = [...new Set([1, count, page - 1, page, page + 1])]
        .filter(value => value >= 1 && value <= count).sort((a, b) => a - b)
    const pages: (number | "ellipsis")[] = []
    visible.forEach((value, index) => {
        const previous = visible[index - 1]
        if (previous && value - previous === 2) pages.push(previous + 1)
        else if (previous && value - previous > 2) pages.push("ellipsis")
        pages.push(value)
    })
    return pages
}

export interface ActiveArchiveFilter {
    key: string
    group: "search" | "tag" | "author" | "id" | "years" | "levelCompleted" | "hasCode" | "authorsPerItem" | "limit"
    label: string
    value?: string
}

export function activeArchiveFilters(filters: IFiltersStoreState): ActiveArchiveFilter[] {
    const result: ActiveArchiveFilter[] = []
    const add = (group: ActiveArchiveFilter["group"], label: string, value?: string) => {
        result.push({ key: JSON.stringify([group, value]), group, label, value })
    }
    if (filters.searchString?.trim()) add("search", `Search: ${filters.searchString.trim()}`)
    for (const tag of new Set(filters.tags || [])) add("tag", `#${tag}`, tag)
    for (const author of new Set(filters.authors || [])) add("author", `Author: ${author}`, author)
    for (const id of new Set(filters.ids || [])) add("id", `Entry: ${id}`, id)
    const start = filters.years?.start
    const end = filters.years?.end
    if (start || end) add("years", start && end ? `${start}–${end}` : start ? `Since ${start}` : `Through ${end}`)
    const completed = filterBoolean(filters.query?.levelCompleted)
    if (completed !== null) add("levelCompleted", completed ? "First level: completed" : "First level: not marked complete")
    const code = filterBoolean(filters.query?.hasCode)
    if (code !== null) add("hasCode", code ? "Has source code" : "No source code listed")
    const authors = positiveNumber(filters.query?.authorsPerItem)
    if (authors) add("authorsPerItem", `Collaborations: up to ${authors} ${authors === 1 ? "author" : "authors"}`)
    const limit = positiveNumber(filters.query?.limit)
    if (limit) add("limit", `Limit: ${limit} projects`)
    return result
}
