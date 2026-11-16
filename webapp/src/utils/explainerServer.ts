import type { GetServerSideProps } from "next"
import { fetchDoomPorts } from "@/src/api"
import { tagPages } from "./tagPages"

export const EXPLAINER_TAG_LIMIT = 12

/** Static copy plus live links to the biggest tag pages. A failed fetch still serves the copy. */
export const explainerProps: GetServerSideProps = async ({ res }) => {
    const items = await fetchDoomPorts()
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400")
    const tags = [...tagPages(items || []).values()]
        .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug))
        .slice(0, EXPLAINER_TAG_LIMIT).map(({ slug, label, count }) => ({ slug, label, count }))
    return { props: { tags, total: items?.length || 0 } }
}
