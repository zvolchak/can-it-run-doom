import type { ParsedUrlQuery } from "querystring"
import { SortOption, type IFilterQuery, type IFiltersStoreState } from "../types/FiltersType"
import { normalizeSearch } from "./archiveSearch"

export function queryValues(value: string | string[] | undefined): string[] {
    return (Array.isArray(value) ? value : value ? [value] : [])
        .flatMap(part => part.split(",")).filter(Boolean)
}

export function queryText(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] || "" : value || ""
}

export function withoutProject(query: ParsedUrlQuery): ParsedUrlQuery {
    return Object.fromEntries(Object.entries(query).filter(([key]) => key !== "project"))
}

/** Stable identity for browsing state; modal-only changes must not reset Redux. */
export function archiveQueryKey(query: ParsedUrlQuery): string {
    return JSON.stringify(Object.fromEntries(Object.entries(withoutProject(query)).sort(([a], [b]) => a.localeCompare(b))))
}

export function archiveFilters(query: ParsedUrlQuery): IFiltersStoreState {
    const number = (key: string) => Number(queryText(query[key])) || null
    const page = Number(queryText(query.page))
    const options: IFilterQuery = {}
    for (const name of ["levelCompleted", "hasCode", "authorsPerItem", "limit"] as const) {
        const value = queryText(query[name])
        if (value) options[name] = value
    }
    const sort = queryText(query.sort)
    if (Object.values(SortOption).includes(sort as SortOption)) options.sort = sort as SortOption
    return {
        tagMatch: (["all", "any"].includes(queryText(query.tagMatch)) ? queryText(query.tagMatch) : queryValues(query.tag).length ? "any" : "all") as "all" | "any",
        tags: queryValues(query.tag), authors: queryValues(query.author), ids: queryValues(query.id),
        searchString: normalizeSearch(queryText(query.search)),
        years: { start: number("yearstart"), end: number("yearend") },
        page: Number.isInteger(page) && page > 0 ? page : 1,
        query: options,
    }
}

/** Next has already decoded query strings. Do not decode them a second time. */
export function archiveQuery(current: ParsedUrlQuery, filters: IFiltersStoreState): ParsedUrlQuery {
    const query = withoutProject(current)
    const set = (key: string, value: unknown) => {
        if (value === undefined || value === null || value === "") delete query[key]
        else query[key] = String(value)
    }
    set("search", filters.searchString)
    set("tag", filters.tags?.join(","))
    set("tagMatch", filters.tags?.length ? filters.tagMatch || "any" : undefined)
    set("author", filters.authors?.join(","))
    set("id", filters.ids?.join(","))
    set("yearstart", filters.years?.start)
    set("yearend", filters.years?.end)
    set("page", filters.page || 1)
    for (const key of ["sort", "limit", "hasCode", "authorsPerItem", "levelCompleted"]) {
        set(key, filters.query?.[key])
    }
    return query
}

export function archiveHref(pathname: string, query: ParsedUrlQuery): string {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
        for (const part of Array.isArray(value) ? value : value === undefined ? [] : [value]) params.append(key, part)
    }
    return `${pathname}${params.size ? `?${params}` : ""}`
}


export interface ProjectLocationEvents {
    on(event: "beforeHistoryChange" | "routeChangeComplete", listener: () => void): void
    off(event: "beforeHistoryChange" | "routeChangeComplete", listener: () => void): void
}

/** Next changes browser history before its concurrent React render commits.
 * Notify after that write, including when the router render is still pending. */
export function subscribeProjectLocation(events: ProjectLocationEvents, target: Pick<Window, "addEventListener" | "removeEventListener">, notify: () => void) {
    let active = true
    const changed = () => queueMicrotask(() => { if (active) notify() })
    events.on("beforeHistoryChange", changed)
    events.on("routeChangeComplete", changed)
    target.addEventListener("popstate", changed)
    return () => {
        active = false
        events.off("beforeHistoryChange", changed)
        events.off("routeChangeComplete", changed)
        target.removeEventListener("popstate", changed)
    }
}

export function projectLocationQuery(href: string): ParsedUrlQuery {
    const params = new URL(href, "http://archive.local").searchParams
    return Object.fromEntries([...new Set(params.keys())].map(key => {
        const values = params.getAll(key)
        return [key, values.length > 1 ? values : values[0]]
    }))
}
