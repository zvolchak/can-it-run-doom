import { useMemo, useState } from "react"
import type { IArchiveItem, IFiltersStoreState } from "@/src/types"
import { archiveFacets, clearedArchiveFilters, tagSearchKey } from "@/src/utils/archiveFacets"
import { getAuthorsFromItems, getYearsFromItems } from "@/src/utils/itemsFilters"

export function ArchiveFilterControls({ items, value, onChange }: {
    items: IArchiveItem[], value: IFiltersStoreState, onChange: (value: IFiltersStoreState) => void
}) {
    const [search, setSearch] = useState("")
    const [authorSearch, setAuthorSearch] = useState("")
    const [all, setAll] = useState(false)
    const facets = useMemo(() => archiveFacets(items, value), [items, value])
    const selected = value.tags.filter(tag => !tag.startsWith("!"))
    const vocabulary = search.trim() ? facets.alphabetical.filter(tag => tagSearchKey(tag).includes(tagSearchKey(search))) : all ? facets.alphabetical : facets.popular
    const years = getYearsFromItems(items).sort((a, b) => a - b)
    const authors = getAuthorsFromItems(items).sort((a, b) => a.localeCompare(b))
    const matchingAuthors = authors.filter(author => author.toLowerCase().includes(authorSearch.toLowerCase()))
    const visibleAuthors = [...new Set([...value.authors, ...matchingAuthors])]
    const change = (patch: Partial<IFiltersStoreState>) => onChange({ ...value, ...patch })
    const tagRow = (tag: string) => <label key={tag} className="tag-filters__choice">
        <input type="checkbox" checked={value.tags.includes(tag)} onChange={() => {
            const tags = value.tags.includes(tag) ? value.tags.filter(item => item !== tag) : [...value.tags, tag]
            change({ tags, tagMatch: tags.length ? value.tagMatch : "all" })
        }} /><span>{tag}</span><small>{facets.count(tag)}</small>
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
        <fieldset className="tag-filters__vocabulary"><legend>{search.trim() ? "Matching tags" : all ? "All tags" : "Popular tags"}</legend>
            {vocabulary.map(tagRow)}
            {vocabulary.length === 0 && <p>No matching tags. Try another name.</p>}
        </fieldset>
        <button type="button" aria-expanded={all} onClick={() => setAll(!all)}>{all ? "Show popular tags" : "Browse all tags"}</button>
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
