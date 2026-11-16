import type { GetServerSideProps } from "next"
import { loadArchive } from "@/src/utils/archiveServer"
import { archiveFilters, queryValues } from "@/src/utils/projectNavigation"
import { projectPath } from "@/src/utils/projectSlug"

export { ArchivePage as default } from "@/src/components/Views/ArchivePage"

export const getServerSideProps: GetServerSideProps = async context => {
    const { items, failed } = await loadArchive(context.res)

    // A single `?id=` is a standalone project: send old links to its clean URL.
    const ids = queryValues(context.query.id)
    if (!failed && context.query.project === undefined && ids.length === 1) {
        const item = items.find(entry => String(entry.id) === ids[0])
        if (item) return { redirect: { destination: projectPath(item.id as string, item.title), statusCode: 301 } }
    }
    return { props: { items, totalSize: items.length, referenceTime: Date.now(), initialArchiveFilters: archiveFilters(context.query) } }
}
