import type { NextRouter } from "next/router"
import type { AppStore } from "../store"
import type { IFiltersStoreState } from "../types/FiltersType"
import { setAppliedFilters } from "../store/filters"
import { archiveFilters, archiveHref, archiveQuery, archiveQueryKey, projectLocationQuery, subscribeProjectLocation } from "./projectNavigation"

/** Searches and page navigation are useful Back/Forward destinations. */
export function archiveHistoryMethod(previous: IFiltersStoreState, next: IFiltersStoreState): "push" | "replace" {
    const pageOnly = next.page !== previous.page && JSON.stringify({ ...next, page: 1 }) === JSON.stringify({ ...previous, page: 1 })
    return (next.searchString || "") !== (previous.searchString || "") || pageOnly ? "push" : "replace"
}

const scheduleWrite = (callback: () => void) => {
    const timer = setTimeout(callback, 0)
    return () => clearTimeout(timer)
}

/** The browser URL is authoritative on navigation; Redux is authoritative during edits. */
export function coordinateArchiveUrl(
    store: Pick<AppStore, "dispatch" | "getState" | "subscribe">,
    getRouter: () => Pick<NextRouter, "events" | "push" | "replace">,
    target: Pick<Window, "location" | "addEventListener" | "removeEventListener">,
    schedule = scheduleWrite,
) {
    let active = true
    let hydrating = false
    let writing = false
    let submittedKey: string | undefined
    let previous = store.getState().appliedFilters
    let pendingMethod: "push" | "replace" = "replace"
    let cancelScheduled = () => {}
    const readQuery = () => projectLocationQuery(target.location.href)
    let observedKey = archiveQueryKey(readQuery())
    const cancel = () => { cancelScheduled(); cancelScheduled = () => {} }
    const hydrate = () => {
        hydrating = true
        store.dispatch(setAppliedFilters(archiveFilters(readQuery())))
        previous = store.getState().appliedFilters
        hydrating = false
    }
    const flush = () => {
        cancel()
        const current = readQuery()
        if (!active || writing || current.project !== undefined || !["/", "/entries"].includes(target.location.pathname)) return
        const next = store.getState().appliedFilters
        const query = archiveQuery(current, next)
        const key = archiveQueryKey(query)
        if (key === archiveQueryKey(current)) { pendingMethod = "replace"; return }
        submittedKey = key
        writing = true
        const method = pendingMethod
        pendingMethod = "replace"
        void getRouter()[method](archiveHref(target.location.pathname, query), undefined, { shallow: true, scroll: false })
            .catch(error => { if (!error?.cancelled) console.error("Archive URL update failed", error) })
            .finally(() => {
                writing = false
                // Only a newer edit warrants another write, never a failed transition.
                if (active && next !== store.getState().appliedFilters) flush()
            })
    }
    hydrate()
    const stopStore = store.subscribe(() => {
        const next = store.getState().appliedFilters
        if (hydrating || next === previous) return
        if (archiveHistoryMethod(previous, next) === "push") pendingMethod = "push"
        previous = next
        cancel()
        cancelScheduled = schedule(flush)
    })
    const events = getRouter().events
    const stopLocation = subscribeProjectLocation(events, target, () => {
        const key = archiveQueryKey(readQuery())
        if (key === observedKey) return
        observedKey = key
        if (writing && key === submittedKey) return
        cancel()
        pendingMethod = "replace"
        hydrate()
    })
    events.on("routeChangeStart", cancel)
    return () => {
        active = false
        cancel()
        stopStore()
        stopLocation()
        events.off("routeChangeStart", cancel)
    }
}
