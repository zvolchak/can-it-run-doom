import type { GetServerSideProps } from "next"
import { fetchDoomPorts } from "@/src/api"
import { buildSitemap } from "@/src/utils/seo"

/** Rendered from the live published archive so new entries appear without a rebuild. */
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    const items = await fetchDoomPorts()
    if (!items) {
        // Never serve a sitemap that silently drops every entry.
        res.statusCode = 503
        res.setHeader("Retry-After", "300")
        res.end()
        return { props: {} }
    }
    res.setHeader("Content-Type", "application/xml; charset=utf-8")
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400")
    res.write(buildSitemap(items))
    res.end()
    return { props: {} }
}

export default function Sitemap() {
    return null
}
