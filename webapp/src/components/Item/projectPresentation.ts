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

export { projectDate } from "../../utils/projectDate"
