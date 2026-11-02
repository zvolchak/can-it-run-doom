import { EItemStatus } from "../@types"
import { jsonParseString, normalizeTagsValues } from "./bodyParsers"

const MAX_TITLE = 200
const MAX_DESCRIPTION = 5000
const MAX_NAME = 100
const MAX_URL = 500
const MAX_SOURCES = 20
const MAX_TAGS = 20
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/
const MIN_PUBLISH_YEAR = 1990
const ONE_DAY_MS = 24 * 60 * 60 * 1000

/** Only absolute http(s) links are stored: they are rendered as hrefs in the archive. */
export function isHttpUrl(value: unknown): boolean {
    if (typeof value !== "string" || value.length > MAX_URL) return false
    try {
        const url = new URL(value.trim())
        return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".")
    } catch {
        return false
    }
}

function validateSources(label: string, value: unknown, required: boolean): string[] {
    const sources = jsonParseString(value)
    if (sources === undefined || sources === null || (Array.isArray(sources) && sources.length === 0)) {
        return required ? [`${label}: add at least one`] : []
    }
    if (!Array.isArray(sources) || sources.length > MAX_SOURCES) return [`${label}: expected a list of at most ${MAX_SOURCES}`]

    const errors: string[] = []
    for (const source of sources) {
        const name = source?.name
        if (required && (typeof name !== "string" || !name.trim() || name.length > MAX_NAME))
            errors.push(`${label}: every entry needs a name (up to ${MAX_NAME} characters)`)
        else if (name !== undefined && name !== null && (typeof name !== "string" || name.length > MAX_NAME))
            errors.push(`${label}: names can be up to ${MAX_NAME} characters`)
        if (!isHttpUrl(source?.url)) errors.push(`${label}: every link must be a valid http(s) URL`)
    }
    return [...new Set(errors)]
}

/**
 * Checks one raw submitted entry. `knownTagIds` is the curated tag collection;
 * when it is empty (not loaded or not migrated yet) tags are only checked for presence.
 */
export function validateSubmission(item: any, knownTagIds: ReadonlySet<string>): string[] {
    const errors: string[] = []
    if (!item || typeof item !== "object") return ["Entry is missing or malformed"]

    if (item.id !== undefined && item.id !== null && !(typeof item.id === "string" && ID_PATTERN.test(item.id)))
        errors.push("id: use up to 64 letters, numbers, dashes or underscores")

    if (typeof item.title !== "string" || !item.title.trim()) errors.push("Title is required")
    else if (item.title.length > MAX_TITLE) errors.push(`Title can be up to ${MAX_TITLE} characters`)

    if (item.description !== undefined && item.description !== null
        && (typeof item.description !== "string" || item.description.length > MAX_DESCRIPTION))
        errors.push(`Description can be up to ${MAX_DESCRIPTION} characters`)

    const published = typeof item.publishDate === "string" ? new Date(item.publishDate) : null
    if (!published || Number.isNaN(published.getTime())) errors.push("Publish date is required")
    else if (published.getUTCFullYear() < MIN_PUBLISH_YEAR) errors.push("Publish date is too far in the past")
    else if (published.getTime() > Date.now() + ONE_DAY_MS) errors.push("Publish date can't be in the future")

    errors.push(...validateSources("Authors", item.authors, true))
    errors.push(...validateSources("Media links", item.sourcesUrl, false))
    errors.push(...validateSources("Source code links", item.sourceCodeUrl, false))

    const tags = normalizeTagsValues(item.tags).filter(Boolean)
    if (tags.length === 0) errors.push("Pick at least one tag")
    else if (tags.length > MAX_TAGS) errors.push(`Pick at most ${MAX_TAGS} tags`)
    else if (knownTagIds.size > 0) {
        const unknown = tags.filter(tag => !knownTagIds.has(tag))
        if (unknown.length) errors.push(`Unknown tags: ${unknown.join(", ")}`)
    }
    return errors
}

/** Anything other than a moderator submits for review: client-set status is ignored. */
export function enforceSubmissionStatus<T extends { status?: EItemStatus }>(items: T[], canPublish: boolean): T[] {
    if (!canPublish) items.forEach(item => { item.status = EItemStatus.pending })
    return items
}

/** The tags of an edit are checked against the curated collection only when present. */
export function validateTags(value: unknown, knownTagIds: ReadonlySet<string>): string[] {
    const tags = normalizeTagsValues(value as string | string[]).filter(Boolean)
    if (tags.length === 0) return ["Pick at least one tag"]
    const unknown = knownTagIds.size > 0 ? tags.filter(tag => !knownTagIds.has(tag)) : []
    return unknown.length ? [`Unknown tags: ${unknown.join(", ")}`] : []
}

/** Keeps a preview only when it points at our own uploaded images; anything else is dropped. */
export function sanitizePreviewImg(value: unknown, bucket: string | undefined): string | null {
    if (typeof value !== "string" || !bucket) return null
    const prefix = `/v0/b/${bucket}/o/doom-preview-images%2F`
    const name = value.slice(prefix.length)
    return value.startsWith(prefix) && /^[A-Za-z0-9_-]+\.[A-Za-z0-9]+\?alt=media$/.test(name) ? value : null
}
