import type { IArchiveItem } from "../types/ItemEntryType"
import { archiveAdditionDate } from "./additionDates"

export const SITE_URL = "https://canitrundoom.org"

/** Pages that must never be indexed or listed in the sitemap. */
/** The sitemap lists every entry; the in-page list only needs a representative head. */
export const ITEM_LIST_LIMIT = 24

export const PRIVATE_PATHS = ["/login", "/signup", "/account", "/entries/add", "/entries/review"]

export function projectCanonicalUrl(id: string | number): string {
    return `${SITE_URL}/entries?id=${encodeURIComponent(String(id))}`
}

/** A standalone entry is its own canonical. Every other view (filters, pages,
 * sorting, tracking params, the modal) canonicalizes to the archive root. */
export function canonicalUrl(standaloneId: string | null): string {
    return standaloneId ? projectCanonicalUrl(standaloneId) : `${SITE_URL}/`
}

/** JSON-LD is embedded in a script tag; `<` must not be able to close it. */
export function jsonLdString(data: unknown): string {
    return JSON.stringify(data).replace(/</g, "\\u003c")
}

function httpUrl(value: unknown): string | null {
    if (typeof value !== "string") return null
    try {
        const url = new URL(value.trim())
        return url.protocol === "http:" || url.protocol === "https:" ? url.href : null
    } catch {
        return null
    }
}

function people(sources: IArchiveItem["authors"] | undefined) {
    return (sources || []).flatMap(source => {
        const name = typeof source?.name === "string" ? source.name.trim() : ""
        if (!name) return []
        const url = httpUrl(source.url)
        return [{ "@type": "Person", name, ...(url ? { url } : {}) }]
    })
}

export function entryJsonLd(item: IArchiveItem) {
    const added = archiveAdditionDate(item)
    const code = httpUrl(item.sourceCodeUrl?.[0]?.url)
    const authors = people(item.authors)
    return {
        "@context": "https://schema.org",
        "@type": code ? "SoftwareSourceCode" : "CreativeWork",
        name: item.title,
        url: projectCanonicalUrl(item.id as string),
        ...(item.description ? { description: item.description.trim() } : {}),
        ...(item.previewImg ? { image: item.previewImg } : {}),
        ...(authors.length ? { author: authors } : {}),
        ...(code ? { codeRepository: code } : {}),
        ...(added ? { datePublished: added } : {}),
        ...(item.tags?.length ? { keywords: item.tags.join(", ") } : {}),
        isPartOf: { "@type": "WebSite", name: "Can It Run Doom?", url: SITE_URL },
    }
}

export function archiveJsonLd(items: IArchiveItem[], description: string) {
    const listed = items.filter(item => item.id !== undefined && item.id !== null && item.title)
    return [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Can It Run Doom?",
            url: SITE_URL,
            description,
        },
        {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Can It Run Doom? archive of Doom ports",
            numberOfItems: listed.length,
            itemListElement: listed.slice(0, ITEM_LIST_LIMIT).map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.title,
                url: projectCanonicalUrl(item.id as string),
            })),
        },
    ]
}

function escapeXml(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&apos;")
}

/** One URL for the archive root plus one per published entry. Entries without a
 * trustworthy date get no lastmod instead of an invented one. */
export function buildSitemap(items: IArchiveItem[]): string {
    const latest = items.map(item => archiveAdditionDate(item)).filter((date): date is string => !!date).sort().pop()
    const urls = [{ loc: `${SITE_URL}/`, lastmod: latest }]
    const seen = new Set<string>()
    for (const item of items) {
        if (item.id === undefined || item.id === null || item.id === "") continue
        const loc = projectCanonicalUrl(item.id)
        if (seen.has(loc)) continue
        seen.add(loc)
        urls.push({ loc, lastmod: archiveAdditionDate(item) || undefined })
    }
    const body = urls.map(({ loc, lastmod }) =>
        `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`).join("\n")
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}
