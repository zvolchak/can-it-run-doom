import { useArchiveUrl } from "./useArchiveUrl"
import Head from "next/head"
import { useEffect, useMemo } from "react"
import { useRouter } from "next/router"
import { useDispatch, useSelector } from "react-redux"
import type { IArchiveItem } from "@/src/types"
import {
    setItems, setTotalSize, setAvailableAuthors, setAvailableTags, setAvailableYears,
    type RootState,
} from "@/src/store"
import { getAuthorsFromItems, getTagsFromItems, getYearsFromItems } from "@/src/utils"
import { archiveHref, queryText, queryValues, withoutProject } from "@/src/utils/projectNavigation"
import { ProjectNavigation } from "../Containers/ProjectNavigation"
import { ProjectDetails } from "../Item/ProjectDetails"
import { projectText } from "../Item/projectPresentation"
import { ArchiveDataView } from "./ArchiveDataView"
import { RecentAdditions } from "../RecentAdditions"
import { BtnScrollPage } from "../Buttons/BtnScrollPage"
import { useAdditionClock } from "./useAdditionClock"
import { recentAdditions } from "@/src/utils/additionDates"
import { activeArchiveFilters } from "@/src/utils/archiveResults"
import { tagPages, tagPath, type TagPage } from "@/src/utils/tagPages"
import { archiveJsonLd, canonicalUrl, entryJsonLd, jsonLdString } from "@/src/utils/seo"

const SITE_DESCRIPTION = "Explore an archive of Doom ports showcasing how the game has been adapted to run on various devices, even those not originally intended for gaming."

export interface ArchivePageProps {
    items: IArchiveItem[]
    totalSize: number
    referenceTime: number
    /** Set by `/entries/[slug]`, where the project id comes from the path, not the query. */
    standaloneId?: string | null
    /** Set by `/tags/[tag]`: the server has already applied this tag's filter. */
    tagPage?: Pick<TagPage, "slug" | "label" | "count"> | null
}

/** Both archive routes share URL hydration, metadata, and one project controller. */
export function ArchivePage({ items, totalSize, referenceTime, standaloneId = null, tagPage = null }: ArchivePageProps) {
    const router = useRouter()
    const dispatch = useDispatch()
    const filters = useSelector((state: RootState) => state.appliedFilters)
    const filtered = activeArchiveFilters(filters).length > 0
    const now = useAdditionClock(items, referenceTime)
    const recent = useMemo(() => recentAdditions(items, now), [items, now])
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
    const standalone = standaloneId !== null || (!hasProject && ids.length === 1)
    const requestedId = hasProject ? queryText(router.query.project) : standaloneId ?? (standalone ? ids[0] : null)
    const item = requestedId === null ? null : items.find(item => String(item.id) === requestedId) || null
    const title = tagPage ? `${tagPage.label} Doom Ports: ${tagPage.count} Projects | Can It Run Doom?` : item ? `${projectText(item.title) || "Untitled project"} | Can It Run Doom?`
        : requestedId !== null ? "Project not found | Can It Run Doom?" : "Can It Run Doom? An Archive of All Known Ports."
    const description = tagPage
        ? `${tagPage.count} Doom ports tagged "${tagPage.label}", with authors, source code and media links. Part of the Can It Run Doom? archive.`
        : projectText(item?.description).slice(0, 150) || SITE_DESCRIPTION
    const canonical = canonicalUrl(standalone && item ? { id: String(item.id), title: item.title } : null, tagPage?.slug)
    const relatedTags = standalone && item
        ? [...tagPages(items).values()].filter(page => page.values.some(value => item.tags?.includes(value))) : []
    const jsonLd = standalone && item ? [entryJsonLd(item)]
        : requestedId === null && !filtered ? archiveJsonLd(items, SITE_DESCRIPTION) : []
    const browseQuery = withoutProject(router.query)
    delete browseQuery.id
    delete browseQuery.slug

    return (
        <ProjectNavigation items={items}>
            <Head>
                <title>{title}</title>
                <link rel="canonical" href={canonical} key="canonical" />
                {standalone && !item && <meta name="robots" content="noindex" key="robots" />}
                {jsonLd.map((entry, index) => (
                    <script key={`ld-${index}`} type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: jsonLdString(entry) }} />
                ))}
                <meta property="og:title" content={title} key="og:title" />
                {description && <meta name="description" content={description} key="description" />}
                {description && <meta property="og:description" content={description} key="og:description" />}
                {description && <meta name="twitter:description" content={description} key="twitter:description" />}
                {item?.previewImg && <meta property="og:image" content={item.previewImg} key="og:image" />}
                <meta name="twitter:card" content={item?.previewImg ? "summary_large_image" : "summary"} key="twitter:card" />
                <meta name="twitter:title" content={title} key="twitter:title" />
                {item?.previewImg && <meta name="twitter:image" content={item.previewImg} key="twitter:image" />}
            </Head>
            {standalone ? (
                <main className="project-standalone">
                    <a className="project-standalone__back" href={archiveHref("/entries", browseQuery)}>← Browse archive</a>
                    {item ? <ProjectDetails item={item} /> : (
                        <section className="project-not-found">
                            <h1>Project not found</h1>
                            <p>This project is not available in the archive.</p>
                        </section>
                    )}
                    {relatedTags.length > 0 && (
                        <nav aria-label="Related tags" className="mt-6 flex flex-wrap gap-2">
                            {relatedTags.map(page => (
                                <a key={page.slug} className="project-tags__filter" href={tagPath(page.slug)}>
                                    More {page.label.toLowerCase()} ports ({page.count})
                                </a>
                            ))}
                        </nav>
                    )}
                </main>
            ) : (
                <>
                    {router.pathname === "/" && !filtered && <RecentAdditions items={recent} now={now} />}
                    <ArchiveDataView items={items} now={now} heading={tagPage ? `${tagPage.label} Doom ports` : undefined} />
                    <BtnScrollPage direction="top" className="bottom-5 sm:bottom-[5rem] right-10 fixed z-10" />
                </>
            )}
        </ProjectNavigation>
    )
}
