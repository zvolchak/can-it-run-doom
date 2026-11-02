// Keep in sync with api/utils/sourceNames.ts: the API stores these names, and this copy makes the
// form preview and legacy unnamed links read the same way.
const MAX_NAME = 100

const SITE_NAMES: Record<string, string> = {
    "youtube.com": "YouTube",
    "youtu.be": "YouTube",
    "reddit.com": "Reddit",
    "redd.it": "Reddit",
    "twitter.com": "Twitter",
    "x.com": "X",
    "imgur.com": "Imgur",
    "vimeo.com": "Vimeo",
    "twitch.tv": "Twitch",
    "itch.io": "itch.io",
    "facebook.com": "Facebook",
    "instagram.com": "Instagram",
    "tiktok.com": "TikTok",
    "bsky.app": "Bluesky",
    "discord.com": "Discord",
    "discord.gg": "Discord",
}

// Code hosts where the first two path segments (owner/repo) say far more than the site does.
const REPO_HOSTS: Record<string, string> = {
    "github.com": "GitHub",
    "gitlab.com": "GitLab",
    "codeberg.org": "Codeberg",
    "bitbucket.org": "Bitbucket",
}

/** A readable label for a link, or null when the value isn't a usable http(s) URL. */
export function sourceNameFromUrl(value: unknown): string | null {
    let url: URL
    try {
        url = new URL(String(value ?? "").trim())
    } catch {
        return null
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return null

    const host = url.hostname.toLowerCase().replace(/^www\./, "")
    if (!host) return null

    if (host in REPO_HOSTS) {
        const [owner, repo] = url.pathname.split("/").filter(Boolean)
        const name = owner ? (repo ? `${owner}/${repo.replace(/\.git$/, "")}` : owner) : REPO_HOSTS[host]
        return name.slice(0, MAX_NAME)
    }

    const known = Object.keys(SITE_NAMES).find(site => host === site || host.endsWith(`.${site}`))
    return (known ? SITE_NAMES[known] : host).slice(0, MAX_NAME)
} // sourceNameFromUrl
