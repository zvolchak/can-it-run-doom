import type { IArchiveItem, IFiltersStoreState } from "../types"
import { archiveTagUsage } from "./archiveTags"
import { archiveResults } from "./archiveResults"

/** Vocabulary normalization is presentation-only: stored values stay intact. */
export const tagSearchKey = (value: string) => value.trim().replace(/^#/, "").toLocaleLowerCase()
/** `allowed` limits the facets to a curated vocabulary; stored tags outside it are left out of the menu. */
export function archiveFacets(items: IArchiveItem[], filters: IFiltersStoreState, allowed?: ReadonlySet<string>) {
    const frequency = archiveTagUsage(items)
    if (allowed) for (const tag of [...frequency.keys()]) if (!allowed.has(tag)) frequency.delete(tag)
    const alphabetical = [...frequency.keys()].sort((a, b) => a.localeCompare(b))
    const ranked = [...alphabetical].sort((a, b) => frequency.get(b) - frequency.get(a) || a.localeCompare(b))
    const popular = ranked.slice(0, 8)
    const count = (tag: string) => archiveResults(items, {
        ...filters, tags: [...new Set([...filters.tags, tag])], query: { ...filters.query, limit: undefined },
    }).total
    return { alphabetical, ranked, popular, count }
}
export function clearedArchiveFilters(filters: IFiltersStoreState): IFiltersStoreState {
    return { tags: [], tagMatch: "all", authors: [], ids: [], years: null, searchString: "", page: 1, query: { sort: filters.query?.sort } }
}
