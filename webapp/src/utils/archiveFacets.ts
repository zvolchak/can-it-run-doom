import type { IArchiveItem, IFiltersStoreState } from "../types"
import { archiveTagUsage } from "./archiveTags"
import { archiveResults } from "./archiveResults"

/** Vocabulary normalization is presentation-only: stored values stay intact. */
export const tagSearchKey = (value: string) => value.trim().replace(/^#/, "").toLocaleLowerCase()
export function archiveFacets(items: IArchiveItem[], filters: IFiltersStoreState) {
    const frequency = archiveTagUsage(items)
    const alphabetical = [...frequency.keys()].sort((a, b) => a.localeCompare(b))
    const popular = [...alphabetical].sort((a, b) => frequency.get(b) - frequency.get(a) || a.localeCompare(b)).slice(0, 8)
    const count = (tag: string) => archiveResults(items, {
        ...filters, tags: [...new Set([...filters.tags, tag])], query: { ...filters.query, limit: undefined },
    }).total
    return { alphabetical, popular, count }
}
export function clearedArchiveFilters(filters: IFiltersStoreState): IFiltersStoreState {
    return { tags: [], tagMatch: "all", authors: [], ids: [], years: null, searchString: "", page: 1, query: { sort: filters.query?.sort } }
}
