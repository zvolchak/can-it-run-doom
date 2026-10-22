import { useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { FiSliders, FiX } from "react-icons/fi"
import { SortOption, type IArchiveItem } from "@/src/types"
import {
    type RootState, setFiltered, setAppliedPage, setAppliedSearch, setAppliedTags,
    setAppliedAuthors, setAppliedId, setAppliedYears, setQuery, clearAppliedFilters,
    setIsFiltersMenu, toggleAppliedTag,
} from "@/src/store"
import { archiveResults, activeArchiveFilters, type ActiveArchiveFilter } from "@/src/utils/archiveResults"
import { archiveTagUsage } from "@/src/utils/archiveTags"
import { ProjectSummary } from "../Item/ProjectSummary"
import { Pagination } from "../Pagination"
import { FiltersMenu } from "../Menus/FiltersMenu"
import { useProjectLink } from "../Containers/ProjectNavigation"

export function ArchiveDataView({ items }: { items: IArchiveItem[] }) {
    const dispatch = useDispatch()
    const projectLink = useProjectLink()
    const filters = useSelector((state: RootState) => state.appliedFilters)
    const filtersOpen = useSelector((state: RootState) => state.settings.isFiltersMenu)
    const results = useMemo(() => archiveResults(items, filters), [items, filters])
    const tagUsage = useMemo(() => archiveTagUsage(items), [items])
    const activeFilters = activeArchiveFilters(filters)

    useEffect(() => {
        dispatch(setFiltered(results.matches))
    }, [dispatch, results])

    function removeFilter(filter: ActiveArchiveFilter) {
        switch (filter.group) {
            case "search": dispatch(setAppliedSearch("")); break
            case "tag": dispatch(setAppliedTags(filters.tags.filter(value => value !== filter.value))); break
            case "author": dispatch(setAppliedAuthors(filters.authors.filter(value => value !== filter.value))); break
            case "id": dispatch(setAppliedId((filters.ids || []).filter(value => value !== filter.value))); break
            case "years": dispatch(setAppliedYears(null)); break
            default: {
                const query = { ...filters.query }
                delete query[filter.group]
                dispatch(setQuery(query))
            }
        }
    }

    function changeSort(value: string) {
        const query = { ...filters.query }
        if (value) query.sort = value as SortOption
        else delete query.sort
        dispatch(setQuery(query))
    }

    function changePage(page: number) {
        dispatch(setAppliedPage(page))
        document.getElementById("archive-heading")?.scrollIntoView({ block: "start" })
    }

    return (
        <main className="archive-browser" aria-labelledby="archive-heading">
            <FiltersMenu items={items} />
            <div className="archive-browser__results">
            <header className="archive-browser__header">
                <h1 id="archive-heading">Explore the archive</h1>
            </header>
            <div className="archive-browser__toolbar">
                <p id="archive-result-count" className="archive-browser__count" role="status" aria-live="polite">
                    <strong>{results.total} {results.total === 1 ? "project" : "projects"}</strong>
                    {results.total > 0 && <span>Showing {results.first}–{results.last}</span>}
                </p>
                <div className="archive-browser__controls">
                    <button type="button" className="archive-browser__filter-button"
                        aria-controls="archive-filters" aria-expanded={filtersOpen}
                        onClick={() => dispatch(setIsFiltersMenu(!filtersOpen))}>
                        <FiSliders aria-hidden="true" /> Filters
                        {activeFilters.length > 0 && <span>({activeFilters.length})</span>}
                    </button>
                    <label className="archive-browser__sort">
                        Sort by
                        <select value={filters.query?.sort || ""} onChange={event => changeSort(event.target.value)}>
                            <option value="">Archive order</option>
                            <option value="latest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                        </select>
                    </label>
                </div>
            </div>
            {activeFilters.length > 0 && (
                <div className="archive-browser__active-filters">
                    <ul aria-label="Active filters">
                        {activeFilters.map(filter => (
                            <li key={filter.key}>
                                <button type="button" aria-label={`Remove filter: ${filter.label}`}
                                    onClick={() => removeFilter(filter)}>
                                    <span>{filter.label}</span><FiX aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button type="button" className="archive-browser__clear" onClick={() => dispatch(clearAppliedFilters())}>
                        Clear all filters
                    </button>
                </div>
            )}
            {results.total > 0 ? (
                <ul className="archive-browser__list" aria-label="Archive projects" aria-describedby="archive-result-count">
                    {results.pageItems.map(item => {
                        const link = projectLink(item.id)
                        return (
                            <li key={item.id || item.title}>
                                <ProjectSummary item={item} projectHref={link.href} onProjectClick={link.onClick}
                                    tagUsage={tagUsage} selectedTags={filters.tags} onTagClick={tag => dispatch(toggleAppliedTag(tag))} />
                            </li>
                        )
                    })}
                </ul>
            ) : (
                <section className="archive-browser__empty" aria-labelledby="archive-empty-heading">
                    <h2 id="archive-empty-heading">{items.length ? "No projects match these filters" : "The archive is unavailable"}</h2>
                    <p>{items.length ? "Try a different search or remove a filter to see more projects." : "Please reload the page to try again."}</p>
                    {activeFilters.length > 0 && (
                        <button type="button" className="archive-browser__filter-button" onClick={() => dispatch(clearAppliedFilters())}>
                            Clear all filters
                        </button>
                    )}
                </section>
            )}
            <Pagination currentPage={results.page} numberOfPages={results.numberOfPages} onPageChange={changePage} />
            </div>
        </main>
    )
}
