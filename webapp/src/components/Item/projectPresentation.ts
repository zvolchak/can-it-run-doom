import type { ISource } from "@/src/types"

export interface ProjectSource {
    key: string
    name: string
    url: string
    hostname: string
}

export interface ProjectAuthor {
    key: string
    name: string
    url: string | null
}

export function projectText(value: unknown): string {
    return typeof value === "string" ? value.trim() : ""
}

export function externalProjectUrl(value: unknown): URL | null {
    const text = projectText(value)
    if (!text) return null

    try {
        const url = new URL(text)
        return url.protocol === "http:" || url.protocol === "https:" ? url : null
    } catch {
        return null
    }
}

// Include an occurrence number so identical legacy records also have unique keys.
function sourceKey(source: string, occurrences: Map<string, number>): string {
    const occurrence = occurrences.get(source) || 0
    occurrences.set(source, occurrence + 1)
    return JSON.stringify([source, occurrence])
}

export function projectSources(sources: ISource[] | null | undefined): ProjectSource[] {
    if (!Array.isArray(sources)) return []
    const occurrences = new Map<string, number>()

    return sources.flatMap(source => {
        const url = externalProjectUrl(source?.url)
        if (!url) return []

        const name = projectText(source?.name) || url.hostname
        return [{
            key: sourceKey(JSON.stringify([url.href, name]), occurrences),
            name,
            url: url.href,
            hostname: url.hostname,
        }]
    })
}

export function projectAuthors(authors: ISource[] | null | undefined): ProjectAuthor[] {
    if (!Array.isArray(authors)) return []
    const occurrences = new Map<string, number>()

    return authors.flatMap(author => {
        const url = externalProjectUrl(author?.url)
        const name = projectText(author?.name) || url?.hostname
        if (!name) return []

        return [{
            key: sourceKey(JSON.stringify([name, url?.href]), occurrences),
            name,
            url: url?.href || null,
        }]
    })
}

export function projectTags(tags: string[] | null | undefined): string[] {
    return Array.isArray(tags) ? [...new Set(tags.map(projectText).filter(Boolean))] : []
}

export function projectDate(value: unknown): { label: string, year: string, dateTime: string } | null {
    const text = projectText(value)
    if (!text) return null

    // Historical records use "Aug 8, 2014"; interpret calendar dates in UTC so
    // the server and browser agree regardless of their local time zones.
    const calendarMatch = /^([a-z]+)\s+(\d{1,2}),\s*(\d{4})$/i.exec(text)
    const isoMatch = /^(\d{4}-\d{2}-\d{2})(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.exec(text)
    let calendar: string
    let timestamp: string

    if (calendarMatch) {
        const months = ["january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december"]
        const monthName = calendarMatch[1].toLowerCase()
        const month = months.findIndex(name => name === monthName || name.slice(0, 3) === monthName)
        if (month < 0) return null
        calendar = `${calendarMatch[3]}-${String(month + 1).padStart(2, "0")}-${calendarMatch[2].padStart(2, "0")}`
        timestamp = calendar
    } else if (isoMatch) {
        calendar = isoMatch[1]
        timestamp = text.includes("T") && !/(Z|[+-]\d{2}:\d{2})$/.test(text) ? `${text}Z` : text
    } else {
        return null
    }

    // Date parsing can silently roll February 31 into March; reject that too.
    const calendarDate = new Date(calendar)
    if (Number.isNaN(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== calendar) return null

    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return null

    const dateTime = date.toISOString().slice(0, 10)

    return {
        label: new Intl.DateTimeFormat("en-US", {
            month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
        }).format(date),
        year: String(date.getUTCFullYear()),
        dateTime,
    }
}
