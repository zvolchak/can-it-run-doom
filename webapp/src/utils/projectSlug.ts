const MAX_SLUG_LENGTH = 60

/** Readable, ASCII-only URL text for a title. Empty when nothing usable remains. */
export function slugify(title: unknown): string {
    if (typeof title !== "string") return ""
    return title.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
        .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        .slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, "")
}

/** The id is always the final segment, so the title part is cosmetic and lookups
 * never depend on stored slugs. Titles can change; the old URL redirects. */
export function projectPath(id: string | number, title?: unknown): string {
    const slug = slugify(title)
    const segment = slug ? `${slug}-${id}` : String(id)
    return `/entries/${encodeURIComponent(segment)}`
}

/** Candidate ids for a `/entries/[slug]` segment: the whole segment first (ids
 * without a title part), then the text after the last hyphen. */
export function projectIdCandidates(segment: unknown): string[] {
    if (typeof segment !== "string" || !segment) return []
    const last = segment.slice(segment.lastIndexOf("-") + 1)
    return [...new Set([segment, last].filter(Boolean))]
}
