import type { IArchiveItem } from "../types/ItemEntryType"
import { projectDate } from "./projectDate"

/** Normalize only on apply/hydration; leave the user's draft untouched. */
export function normalizeSearch(value: unknown): string {
    return typeof value === "string" ? value.trim().replace(/\s+/gu, " ") : ""
}

function key(value: string): string {
    return value.normalize("NFKC").toLowerCase()
}

function words(value: string): string[] {
    return key(value).match(/[\p{L}\p{N}]+/gu) || []
}

interface SearchTerm {
    tag: boolean
    text: string
    words: string[]
}

function matchesWords(term: SearchTerm, text: string, candidates: string[]): boolean {
    return term.words.length ? term.words.every(word => candidates.some(candidate => candidate.startsWith(word)))
        : !!term.text && key(text).includes(term.text)
}

/** Every term must match a case-insensitive word prefix. #terms search tags only;
 * plain terms search titles, author names, tags, IDs and validated project dates. */
export function searchArchive(items: IArchiveItem[], query: string): IArchiveItem[] {
    const normalized = normalizeSearch(query)
    if (!normalized) return items
    const terms: SearchTerm[] = normalized.split(" ").map(value => {
        const tag = value.startsWith("#")
        const text = key(tag ? value.slice(1) : value)
        return { tag, text, words: words(text) }
    })
    return items.filter(item => {
        const tags = (item.tags || []).filter((tag): tag is string => typeof tag === "string")
        const tagWords = tags.map(words)
        const date = projectDate(item.publishDate)
        const text = [item.title, ...(item.authors || []).map(author => author?.name), ...tags,
            item.id, date?.label, date?.dateTime].filter(value => typeof value === "string").join(" ")
        const candidates = words(text)
        return terms.every(term => term.tag
            ? tags.some((tag, index) => matchesWords(term, tag, tagWords[index]))
            : matchesWords(term, text, candidates))
    })
}
