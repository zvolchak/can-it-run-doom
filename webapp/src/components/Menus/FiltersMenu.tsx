"use client"
import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch, } from "react-redux"
import { RiMenuFoldLine } from "react-icons/ri"
import {
    IArchiveItem,
    IFiltersStoreState,
    ISettingsStoreState,
} from "@/src/types"
import { 
    RootState,
    setIsFiltersMenu,
    isFilterApplied,
    setAppliedYears,
    setAppliedTags,
    setAppliedAuthors,
    setQuery,
} from "@/src/store"
import {
    Tag,
    RangePicker,
    TagsContainer,
    FirstLevelCompletedInput,
} from "@/src/components"
import {
    getTagsFromItems,
    getAuthorsFromItems,
} from "@/src/utils"


export const FiltersMenu = ({ items }: { items: IArchiveItem[] }) => {
    const dispatch = useDispatch()
    const filters: IFiltersStoreState = useSelector((state: RootState) => state.availableFilters)
    const appliedFilters: IFiltersStoreState = useSelector((state: RootState) => state.appliedFilters)
    const isFiltersApplied: boolean = useSelector((state: RootState) => isFilterApplied(state))

    const settings: ISettingsStoreState = useSelector((state: RootState) => state.settings)
    const closeRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (!settings.isFiltersMenu) return
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
        closeRef.current?.focus({ preventScroll: true })
        return () => {
            if (opener?.isConnected && (document.activeElement === document.body
                || document.activeElement?.closest("#archive-filters"))) opener.focus({ preventScroll: true })
        }
    }, [settings.isFiltersMenu])

    const appliedTags = appliedFilters.tags
    const queryAuthors = appliedFilters.authors
    const yearQuery = appliedFilters.years

    const isAuthorsHighlight = Object.keys(appliedFilters.authors).length > 0

    const activeTags = isFiltersApplied ? getTagsFromItems(items) : []
    const activeAuthors = isFiltersApplied ? getAuthorsFromItems(items) : []
    const availableYears = (filters.availableYears || []).filter(Number.isFinite).sort((a, b) => a - b)

    function onYearRangeChanged(value: string, key: string) {
        const range = { 
            start: appliedFilters?.years?.start, 
            end: appliedFilters?.years?.end 
        }
        
        range[key] = Number(value) || null

        dispatch(setAppliedYears(range))

        window.scrollTo({ top: 0, behavior: 'smooth' })
    } // onYearRangeChanged
    
 
    function createRangeValues(start: number, end: number) {
        const result = availableYears.filter(i => i >= start && i <= end)
            .map(i => ({ value: i.toString(), label: i.toString() }))
        return result
    } // createSequenceValues


    function onClose() {
        dispatch(setIsFiltersMenu(false))
    } // onClose


    function onLvlFilterChanged(value: boolean | null) {
        const query = { 
            ...appliedFilters.query, 
            levelCompleted: value === null ? null : value,
        }
        dispatch(setQuery(query))
    }


    return (
        <nav 
            id="archive-filters" aria-label="Archive filters" inert={!settings.isFiltersMenu}
            className={`archive-filters sidebar ${settings.isFiltersMenu ? "open" : ""}`}
        >
            <div className="flex justify-end w-full p-2 bg-gray-700">
                <button ref={closeRef} type="button" onClick={onClose} aria-label="Close filters">
                    <RiMenuFoldLine size="24px" />
                </button>
            </div>
            
            <hr className="border-1"/>

            <div className="flex flex-col justify-between items-center w-full bg-gray-700">
                <div className="
                        flex flex-row doom-color-slate bg-gray-700
                        w-full justify-end p-2 py-4 pl-5
                    "
                >
                    <p className="font-semibold text-l">
                        {items.length} {items.length === 1 ? "project" : "projects"}
                    </p>
                </div>

                {filters.availableYears &&
                    <div className="w-full bg-gray-700">
                        <RangePicker 
                            minLabel="Start Year"
                            minOptions={[
                                { label: "Lowest", value: "" }, 
                                ...createRangeValues(
                                    (availableYears[0] || 1993),
                                    yearQuery?.end || new Date().getFullYear()
                                )
                            ]} 
                            maxLabel="End Year"
                            maxOptions={[
                                { label: "Highest", value: "" }, 
                                ...createRangeValues(
                                    (yearQuery?.start || availableYears[0] || 1993),
                                    new Date().getFullYear()
                                )
                            ]} 
                            onMinChange={(e) => onYearRangeChanged(e, "start")}
                            onMaxChange={(e) => onYearRangeChanged(e, "end")}

                            minValue={appliedFilters?.years?.start?.toString() || ""}
                            maxValue={appliedFilters?.years?.end?.toString() || ""}
                        />
                    </div>
                }

                <TagsContainer 
                    title="Tags" 
                    onClearClick={() => dispatch(setAppliedTags([]))}
                    activeTags={activeTags}
                >
                    <div className="
                            flex flex-row flex-wrap
                            tags-container scroll-slate gap-2 pt-5 px-4 pb-10
                        "
                    >
                        {
                            filters.tags.map((tag: string) =>
                                <Tag 
                                    key={`tag_${tag}`}
                                    text={`#${tag}`} 
                                    queryKey="tags"
                                    onDispatch={setAppliedTags}
                                    className={`
                                        ${
                                            appliedTags?.indexOf(tag) >= 0 
                                            ? "active" : ""
                                        }
                                        ${
                                            isFiltersApplied
                                            && activeTags?.indexOf(tag) >= 0 &&
                                            appliedTags?.indexOf(tag) < 0 
                                            ? "highlight" : ""
                                        }
                                    `}
                                />
                            )
                        }
                    </div>
                </TagsContainer>

                <div className="my-4 w-full">
                    <FirstLevelCompletedInput 
                        value={appliedFilters.query?.levelCompleted?.toString() || null}
                        onChange={onLvlFilterChanged}
                    />
                </div>

                <TagsContainer 
                    title="Authors"
                    onClearClick={() => dispatch(setAppliedAuthors([]))}
                    activeTags={queryAuthors}
                >
                    <div className="tags-container scroll-slate flex flex-row flex-wrap gap-2 pt-5 px-4 pb-10">
                        {
                            filters.authors.map((author: string) =>
                                <Tag 
                                    key={`author_${author}`} 
                                    text={author} 
                                    queryKey="authors"
                                    onDispatch={setAppliedAuthors}
                                    className={`
                                        ${
                                            activeAuthors.indexOf(author) >= 0
                                            && !isAuthorsHighlight 
                                            ? "highlight" : ""
                                        }
                                        ${
                                            isAuthorsHighlight 
                                            && appliedFilters.authors.indexOf(author) >= 0 
                                            ? "active" : ""
                                        }
                                    `}
                                />
                            )
                        }
                    </div>
                </TagsContainer>
            </div>
        </nav>
    )
}
