import { useEffect, useRef } from "react"
import { useRouter } from "next/router"
import { store, setAppliedFilters } from "@/src/store"
import { archiveFilters, archiveHref, archiveQuery, archiveQueryKey } from "@/src/utils/projectNavigation"

/** One coordinator owns hydration and committed browsing writes. */
export function useArchiveUrl() {
    const router = useRouter()
    const currentRouter = useRef(router)
    currentRouter.current = router
    useEffect(() => {
        if (!router.isReady) return
        let timer: ReturnType<typeof setTimeout>
        let hydrating = false
        let writing = false
        let submitted = store.getState().appliedFilters
        let previous = submitted
        let pageNavigation = false
        const hydrate = (query = currentRouter.current.query) => {
            hydrating = true
            store.dispatch(setAppliedFilters(archiveFilters(query)))
            previous = store.getState().appliedFilters
            hydrating = false
        }
        const flush = () => {
            const route = currentRouter.current
            if (writing || route.query.project !== undefined) return
            const next = store.getState().appliedFilters
            const query = archiveQuery(route.query, next)
            if (archiveQueryKey(query) === archiveQueryKey(route.query)) return
            submitted = next
            writing = true
            const method = pageNavigation ? "push" : "replace"
            pageNavigation = false
            void route[method](archiveHref(route.pathname, query), undefined, { shallow: true, scroll: false })
                .catch(error => { if (!error?.cancelled) console.error("Archive URL update failed", error) })
                .finally(() => {
                    writing = false
                    // Edits made during an in-flight write win over its older URL.
                    if (submitted !== store.getState().appliedFilters) flush()
                })
        }
        hydrate()
        const stop = store.subscribe(() => {
            const next = store.getState().appliedFilters
            if (hydrating || next === previous) return
            pageNavigation = next.page !== previous.page && JSON.stringify({ ...next, page: 1 }) === JSON.stringify({ ...previous, page: 1 })
            const searching = next.searchString !== previous.searchString
            previous = next
            clearTimeout(timer)
            timer = setTimeout(flush, searching ? 300 : 0)
        })
        const cancel = () => clearTimeout(timer)
        const complete = (url: string) => {
            clearTimeout(timer)
            if (!writing) {
                // Completion can precede React's next router snapshot.
                const params = new URL(url, window.location.origin).searchParams
                const query = Object.fromEntries([...new Set(params.keys())].map(key => {
                    const values = params.getAll(key)
                    return [key, values.length > 1 ? values : values[0]]
                }))
                hydrate(query)
            }
        }
        router.events.on("routeChangeStart", cancel)
        router.events.on("routeChangeComplete", complete)
        return () => {
            clearTimeout(timer)
            stop()
            router.events.off("routeChangeStart", cancel)
            router.events.off("routeChangeComplete", complete)
        }
        // Router snapshots change on every shallow transition; refs keep callbacks current.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady, router.pathname])
}
