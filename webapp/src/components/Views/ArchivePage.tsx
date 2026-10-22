import { useArchiveUrl } from "./useArchiveUrl"
import Head from "next/head"
import { useEffect } from "react"
import { useRouter } from "next/router"
import { useDispatch, useSelector } from "react-redux"
import type { IArchiveItem } from "@/src/types"
import {
    setItems, setTotalSize, setAvailableAuthors, setAvailableTags, setAvailableYears,
    isFilterApplied,
} from "@/src/store"
import { getAuthorsFromItems, getTagsFromItems, getYearsFromItems } from "@/src/utils"
import { archiveHref, queryText, queryValues, withoutProject } from "@/src/utils/projectNavigation"
import { ProjectNavigation } from "../Containers/ProjectNavigation"
import { ProjectDetails } from "../Item/ProjectDetails"
import { projectText } from "../Item/projectPresentation"
import { ArchiveDataView } from "./ArchiveDataView"
import { MiniCategorizedView } from "./MiniCategorizedView"

export interface ArchivePageProps {
    items: IArchiveItem[]
    totalSize: number
}

/** Both archive routes share URL hydration, metadata, and one project controller. */
export function ArchivePage({ items, totalSize }: ArchivePageProps) {
    const router = useRouter()
    const dispatch = useDispatch()
    const filtered = useSelector(isFilterApplied)
    useArchiveUrl()

    useEffect(() => {
        dispatch(setItems(items))
        dispatch(setTotalSize(totalSize))
        dispatch(setAvailableTags(getTagsFromItems(items)))
        dispatch(setAvailableAuthors(getAuthorsFromItems(items).sort()))
        dispatch(setAvailableYears(getYearsFromItems(items)))
    }, [dispatch, items, totalSize])


    const ids = queryValues(router.query.id)
    const hasProject = router.query.project !== undefined
    const standalone = !hasProject && ids.length === 1
    const requestedId = hasProject ? queryText(router.query.project) : standalone ? ids[0] : null
    const item = requestedId === null ? null : items.find(item => String(item.id) === requestedId) || null
    const title = item ? `${projectText(item.title) || "Untitled project"} | Can It Run Doom?`
        : requestedId !== null ? "Project not found | Can It Run Doom?" : "Can It Run Doom? An Archive of All Known Ports."
    const description = projectText(item?.description).slice(0, 150)
    const browseQuery = withoutProject(router.query)
    delete browseQuery.id

    return (
        <ProjectNavigation items={items}>
            <Head>
                <title>{title}</title>
                <meta property="og:title" content={title} key="og:title" />
                {description && <meta name="description" content={description} key="description" />}
                {description && <meta property="og:description" content={description} key="og:description" />}
                {description && <meta name="twitter:description" content={description} key="twitter:description" />}
                {item?.previewImg && <meta property="og:image" content={item.previewImg} key="og:image" />}
            </Head>
            {standalone ? (
                <main className="project-standalone">
                    <a className="project-standalone__back" href={archiveHref(router.pathname, browseQuery)}>← Browse archive</a>
                    {item ? <ProjectDetails item={item} /> : (
                        <section className="project-not-found">
                            <h1>Project not found</h1>
                            <p>This project is not available in the archive.</p>
                        </section>
                    )}
                </main>
            ) : (
                <>
                    <ArchiveDataView items={items} />
                    {!filtered && items.length > 0 && <MiniCategorizedView items={items} />}
                </>
            )}
        </ProjectNavigation>
    )
}
