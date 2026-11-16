import type { GetServerSideProps } from "next"
import { ArchivePage } from "@/src/components/Views/ArchivePage"
import { loadArchive } from "@/src/utils/archiveServer"
import { archiveFilters, queryText } from "@/src/utils/projectNavigation"
import { projectIdCandidates, projectPath } from "@/src/utils/projectSlug"

/** `/entries/<title-slug>-<id>`: the id is the last segment, so the title part is cosmetic. */
export default ArchivePage

export const getServerSideProps: GetServerSideProps = async context => {
    const segment = queryText(context.params?.slug)
    const { items, failed } = await loadArchive(context.res)
    const candidates = projectIdCandidates(segment)
    const item = candidates.map(id => items.find(entry => String(entry.id) === id)).find(Boolean)

    if (!failed && !item) return { notFound: true }
    if (item && projectPath(item.id as string, item.title) !== `/entries/${encodeURIComponent(segment)}`)
        return { redirect: { destination: projectPath(item.id as string, item.title), statusCode: 301 } }

    return {
        props: {
            items, totalSize: items.length, referenceTime: Date.now(),
            initialArchiveFilters: archiveFilters({}),
            standaloneId: item ? String(item.id) : null,
        },
    }
}
