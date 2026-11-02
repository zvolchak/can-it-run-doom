import { useMemo, useState } from "react"
import type { IArchiveItem, IFiltersStoreState, ITag } from "@/src/types"
import { archiveFacets, clearedArchiveFilters, tagSearchKey } from "@/src/utils/archiveFacets"
import { archiveTagUsage } from "@/src/utils/archiveTags"
import { getAuthorsFromItems, getYearsFromItems } from "@/src/utils/itemsFilters"

const INITIAL_TAGS = 8
const MORE_TAGS = 10

export function ArchiveFilterControls({ items, value, onChange, vocabulary = null }: {
    items: IArchiveItem[], value: IFiltersStoreState, onChange: (value: IFiltersStoreState) => void,
    /** Curated tags. Without it the menu falls back to the raw tags stored on the projects. */
    vocabulary?: ITag[] | null
}) {
    const [search, setSearch] = useState("")
    const [authorSearch, setAuthorSearch] = useState("")
    const [shown, setShown] = useState(INITIAL_TAGS)
    const known = useMemo(() => vocabulary && new Map(vocabulary.map(tag => [tag.id, tag])), [vocabulary])
    const facets = useMemo(() => archiveFacets(items, value, known ? new Set(known.keys()) : undefined), [items, value, known])
    const usage = useMemo(() => archiveTagUsage(items), [items])
    const tagLabel = (tag: string) => known?.get(tag)?.label ?? tag
    const selected = value.tags.filter(tag => !tag.startsWith("!"))
    const matchesSearch = (tag: string) => [tag, tagLabel(tag)].some(text => tagSearchKey(text).includes(tagSearchKey(search)))
    const visibleTags = search.trim() ? facets.alphabetical.filter(matchesSearch).sort((a, b) => (usage.get(b) || 0) - (usage.get(a) || 0) || tagLabel(a).localeCompare(tagLabel(b))) : facets.ranked.slice(0, shown)
    const years = getYearsFromItems(items).sort((a, b) => a - b)
    const authors = getAuthorsFromItems(items).sort((a, b) => a.localeCompare(b))
    const matchingAuthors = authors.filter(author => author.toLowerCase().includes(authorSearch.toLowerCase()))
    const visibleAuthors = [...new Set([...value.authors, ...matchingAuthors])]
    const change = (patch: Partial<IFiltersStoreState>) => onChange({ ...value, ...patch })
    const tagRow = (tag: string) => <label key={tag} className="tag-filters__choice">
        <input type="checkbox" checked={value.tags.includes(tag)} onChange={() => {
            const tags = value.tags.includes(tag) ? value.tags.filter(item => item !== tag) : [...value.tags, tag]
            change({ tags, tagMatch: tags.length ? value.tagMatch : "all" })
        }} /><span>{tagLabel(tag)}</span><small>{facets.count(tag)}</small>
    </label>
    return <div className="tag-filters">
        <h2 tabIndex={-1} id="archive-tags-heading">Tags</h2>
        <p className="tag-filters__help">Counts show projects with this tag added, before any legacy result limit.</p>
        {selected.length > 0 && <label>Match<select value={value.tagMatch || "any"} onChange={event => change({ tagMatch: event.target.value as "all" | "any" })}>
            <option value="all">All selected tags</option><option value="any">Any selected tag</option>
        </select></label>}
        {selected.length > 0 && <fieldset><legend>Selected tags</legend>{selected.map(tagRow)}</fieldset>}
        <button type="button" onClick={() => change({ tags: [], tagMatch: "all" })}>Clear tags</button>
        <label>Find a tag<input type="search" value={search} onChange={event => setSearch(event.target.value)} /></label>
        <fieldset className="tag-filters__vocabulary"><legend>{search.trim() ? "Matching tags" : "Popular tags"}</legend>
            {visibleTags.map(tagRow)}
            {visibleTags.length === 0 && <p>No matching tags. Try another name.</p>}
        </fieldset>
        {!search.trim() && facets.ranked.length > shown && <button type="button" onClick={() => setShown(shown + MORE_TAGS)}>Show more tags</button>}
        {!search.trim() && shown > INITIAL_TAGS && <button type="button" onClick={() => setShown(INITIAL_TAGS)}>Show fewer tags</button>}
        <details><summary>More filters</summary>
            <label className="tag-filters__choice"><input type="checkbox" checked={String(value.query?.hasCode) === "true"} onChange={event => change({ query: { ...value.query, hasCode: event.target.checked ? true : undefined } })} />Source code linked</label>
            <label>Find an author<input type="search" value={authorSearch} onChange={event => setAuthorSearch(event.target.value)} /></label>
            <fieldset className="tag-filters__authors"><legend>Authors (match any)</legend>{visibleAuthors.map(author =>
                <label className="tag-filters__choice" key={author}><input type="checkbox" checked={value.authors.includes(author)} onChange={() => change({ authors: value.authors.includes(author) ? value.authors.filter(item => item !== author) : [...value.authors, author] })} /><span>{author}</span></label>)}</fieldset>
            {(["start", "end"] as const).map(key => <label key={key}>{key === "start" ? "From" : "To"}<select value={value.years?.[key] || ""} onChange={event => change({ years: { start: value.years?.start || null, end: value.years?.end || null, [key]: Number(event.target.value) || null } })}>
                <option value="">Any year</option>{years.map(year => <option key={year} value={year} disabled={key === "start" ? !!value.years?.end && year > value.years.end : !!value.years?.start && year < value.years.start}>{year}</option>)}
            </select></label>)}
        </details>
        <button type="button" onClick={() => onChange(clearedArchiveFilters(value))}>Clear filters</button>
    </div>
}
