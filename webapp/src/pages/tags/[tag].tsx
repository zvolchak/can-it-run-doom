import type { GetServerSideProps } from "next"
import { ArchivePage } from "@/src/components/Views/ArchivePage"
import { loadArchive } from "@/src/utils/archiveServer"
import { archiveFilters, queryText } from "@/src/utils/projectNavigation"
import { slugify } from "@/src/utils/projectSlug"
import { tagPages } from "@/src/utils/tagPages"

/** Crawlable landing page per tag: `/tags/calculator` lists every project with that tag. */
export default ArchivePage

export const getServerSideProps: GetServerSideProps = async context => {
    const requested = queryText(context.params?.tag)
    const { items, failed } = await loadArchive(context.res)
    const page = tagPages(items).get(requested)

    if (!failed && !page) {
        // `/tags/Calculators` and similar spellings go to the one canonical slug.
        const normalized = slugify(requested)
        const alias = normalized !== requested ? tagPages(items).get(normalized) : undefined
        if (alias) return { redirect: { destination: `/tags/${encodeURIComponent(alias.slug)}`, statusCode: 301 } }
        return { notFound: true }
    }

    return {
        props: {
            items, totalSize: items.length, referenceTime: Date.now(),
            initialArchiveFilters: archiveFilters(page ? { tag: page.values.join(","), tagMatch: "any" } : {}),
            tagPage: page ? { slug: page.slug, label: page.label, count: page.count } : null,
        },
    }
}
