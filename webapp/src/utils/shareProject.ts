export type ShareResult = "shared" | "copied" | "cancelled" | "failed"

interface ShareNavigator {
    share?: (data: { title: string, url: string }) => Promise<void>
    clipboard?: { writeText: (text: string) => Promise<void> }
}

/** One canonical link per entry, free of the sharer's filters and pagination. */
export function projectShareUrl(origin: string, id: string | number): string {
    return `${origin.replace(/\/+$/, "")}/entries?id=${encodeURIComponent(String(id))}`
}

/** Native share sheet when available, clipboard otherwise. */
export async function shareProject(nav: ShareNavigator, title: string, url: string): Promise<ShareResult> {
    if (nav.share) {
        try {
            await nav.share({ title, url })
            return "shared"
        } catch (error) {
            if ((error as Error)?.name === "AbortError") return "cancelled"
        }
    }
    try {
        if (!nav.clipboard) return "failed"
        await nav.clipboard.writeText(url)
        return "copied"
    } catch {
        return "failed"
    }
}

export interface ShareTarget {
    id: "x" | "facebook" | "reddit" | "bluesky" | "linkedin"
    label: string
    href: string
}

/** Platforms with a public web share intent. Discord has none, so it is handled as copy-link. */
export function shareTargets(title: string, url: string): ShareTarget[] {
    const u = encodeURIComponent(url)
    const t = encodeURIComponent(title)
    const text = encodeURIComponent(`${title} - Can It Run Doom?`)
    return [
        { id: "x", label: "X", href: `https://x.com/intent/post?url=${u}&text=${text}` },
        { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
        { id: "reddit", label: "Reddit", href: `https://www.reddit.com/submit?url=${u}&title=${t}` },
        { id: "bluesky", label: "Bluesky", href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} - Can It Run Doom? ${url}`)}` },
        { id: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    ]
}
