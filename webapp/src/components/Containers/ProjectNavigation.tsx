import { createContext, useContext, useEffect, useRef, type MouseEvent, type ReactNode } from "react"
import { useRouter } from "next/router"
import { useSelector } from "react-redux"
import type { RootState } from "@/src/store"
import type { IArchiveItem } from "@/src/types"
import { archiveHref, archiveQuery, archiveQueryKey, queryText, withoutProject } from "@/src/utils/projectNavigation"
import { ItemPreviewModal } from "./ItemPreviewModal"

type ProjectLink = { href: string, onClick: (event: MouseEvent<HTMLAnchorElement>) => void }
const ProjectNavigationContext = createContext<((id: string) => ProjectLink) | null>(null)

export function useProjectLink() {
    const link = useContext(ProjectNavigationContext)
    if (!link) throw new Error("Project links must be inside ProjectNavigation")
    return link
}

interface OpenedProject {
    id: string
    pathname: string
    browseKey: string
    x: number
    y: number
    opener: HTMLElement
}

export function ProjectNavigation({ items, children }: { items: IArchiveItem[], children: ReactNode }) {
    const router = useRouter()
    const filters = useSelector((state: RootState) => state.appliedFilters)
    const opened = useRef<OpenedProject | null>(null)
    const navigating = useRef(false)
    const closing = useRef(false)
    const projectId = router.query.project === undefined ? null : queryText(router.query.project)
    const previousProject = useRef(projectId)
    const browseKey = archiveQueryKey(router.query)

    useEffect(() => {
        closing.current = false
        const previous = previousProject.current
        previousProject.current = projectId
        const origin = opened.current
        if (previous === null || projectId !== null || !origin
            || origin.pathname !== router.pathname || origin.browseKey !== browseKey) return

        const frame = requestAnimationFrame(() => {
            window.scrollTo(origin.x, origin.y)
            if (origin.opener.isConnected) origin.opener.focus({ preventScroll: true })
        })
        return () => cancelAnimationFrame(frame)
    }, [projectId, browseKey, router.pathname])

    function projectLink(id: string): ProjectLink {
        const baseQuery = archiveQuery(router.query, filters)
        const href = archiveHref(router.pathname, { ...baseQuery, project: id })
        return {
            href,
            onClick: event => {
                if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                event.preventDefault()
                if (navigating.current) return
                navigating.current = true
                const origin: OpenedProject = {
                    id, pathname: router.pathname, browseKey: archiveQueryKey(baseQuery),
                    x: window.scrollX, y: window.scrollY, opener: event.currentTarget,
                }

                async function navigate() {
                    // Commit Redux-only changes to the existing history entry first,
                    // so Back returns to the same filters rather than an old URL.
                    if (archiveQueryKey(router.query) !== origin.browseKey) {
                        const replaced = await router.replace(archiveHref(origin.pathname, baseQuery), undefined, { shallow: true, scroll: false })
                        if (!replaced) return
                    }
                    opened.current = origin
                    const pushed = await router.push(href, undefined, { shallow: true, scroll: false })
                    if (!pushed) opened.current = null
                }
                void navigate().catch(error => {
                    opened.current = null
                    if (!error?.cancelled) window.location.assign(href)
                }).finally(() => { navigating.current = false })
            },
        }
    }

    function closeProject() {
        if (closing.current) return
        closing.current = true
        const origin = opened.current
        if (origin?.id === projectId && origin.pathname === router.pathname && origin.browseKey === browseKey) {
            router.back()
        } else {
            // A copied/refreshed URL has no known archive history entry to return to.
            const href = archiveHref(router.pathname, withoutProject(router.query))
            void router.replace(href, undefined, { shallow: true, scroll: false })
                .catch(error => { if (!error?.cancelled) window.location.assign(href) })
                .finally(() => { closing.current = false })
        }
    }

    const item = projectId === null ? null : items.find(item => String(item.id) === projectId) || null
    return (
        <ProjectNavigationContext.Provider value={projectLink}>
            {children}
            {projectId !== null && <ItemPreviewModal item={item} onClose={closeProject} />}
        </ProjectNavigationContext.Provider>
    )
}
