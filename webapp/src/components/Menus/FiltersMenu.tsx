"use client"
import React, { useRef, } from 'react'
import { useSelector, useDispatch, } from "react-redux"
import { FaRegWindowClose } from "react-icons/fa"
import {
    IArchiveItem,
    IFiltersStoreState,
    ISettingsStoreState,
} from "@/src/types"
import { 
    RootState,
    // setAppliedYears,
    setIsFiltersMenu,
    setAppliedTags,
    setAppliedAuthors,
    isFilterApplied,
} from "@/src/store"
import {
    Tag,
    // RangePicker,
    TagsContainer,
} from "@/src/components"
import {
    getTagsFromItems,
    getAuthorsFromItems,
} from "@/src/utils"


export const FiltersMenu = () => {
    const dispatch = useDispatch()
    const filters: IFiltersStoreState = useSelector((state: RootState) => state.availableFilters)
    const appliedFilters: IFiltersStoreState = useSelector((state: RootState) => state.appliedFilters)
    const isFiltersApplied: boolean = useSelector((state: RootState) => isFilterApplied(state))

    // Use filtered items list if at least one filter is applied. Otherwise, use full items list.
    const items: IArchiveItem[] = useSelector(
        (state: RootState) => {
            return isFilterApplied(state) ? 
                            state.submissions.filtered : state.submissions.items
        }
    )

    const settings: ISettingsStoreState = useSelector((state: RootState) => state.settings)
    const menuRef = useRef(null)

    const appliedTags = appliedFilters.tags
    const queryAuthors = appliedFilters.authors

    const isAuthorsHighlight = Object.keys(appliedFilters.authors).length > 0

    const activeTags = isFiltersApplied ? getTagsFromItems(items) : []
    const activeAuthors = isFiltersApplied ? getAuthorsFromItems(items) : []
    // function onYearRangeChanged(value: string, yearType: string) {
    //     const query = router.query
    //     const keyName = `year${yearType}`
    //     // dispatch(setAppliedYears({ `${qyearType}`: value }))
    //     // if (!Number(value) || query[keyName] === value)
    //     //     delete query[`year${yearType}`]
    //     // else
    //     //     query[keyName] = value

    //     // router.push({
    //     //     pathname: router.pathname,
    //     //     query,
    //     // }, undefined, { scroll: false })
    // } // onYearRangeChanged
    
 
    // function createRangeValues(start: number, end: number) {
    //     const result = filters.years.filter(i => i >= start && i <= end)
    //         .map(i => ({ value: i.toString(), label: i.toString() }))
    //     return result
    // } // createSequenceValues

    // function createRangeValues(start: number, end: number) {
    //     return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    //         .map(i => ({ value: i.toString(), label: i.toString() }))
    // }


    function onClose() {
        dispatch(setIsFiltersMenu(false))
    } // onClose


    return (
        <nav 
            className={
                `h-full absolute sidebar 
                sm:top-20
                top-40
                pl-2
                z-1 
                ${settings.isFiltersMenu ? "open" : ""}`
            }
            ref={menuRef}
        >
            <div className="flex justify-end w-full p-2 bg-gray-700">
                <button onClick={onClose}>
                    <FaRegWindowClose size="24px" />
                </button>
            </div>
            
            <hr className="border-1"/>

            <div className="flex flex-col justify-between items-center w-80">
                <div className="flex flex-row doom-color-slate bg-gray-700
                    w-full justify-between p-2 py-4 pl-5"
                >
                    <p className="font-semibold text-l">
                        {items.length} Item{items.length > 1 ? "s" : ""}
                    </p>
                </div>

                <TagsContainer title="Tags" queryKey="tags" activeTags={activeTags}>
                    <div className="tags-container scroll-slate flex flex-row flex-wrap gap-2 pt-5 px-4 pb-10">
                        {
                            filters.tags.map((tag: string) =>
                                <Tag 
                                    key={`tag_${tag}`} 
                                    text={`#${tag}`} 
                                    queryKey="tags"
                                    onDispatch={setAppliedTags}
                                    className={`
                                        ${
                                            appliedTags.indexOf(tag) >= 0 
                                            ? "active" : ""
                                        }
                                        ${
                                            isFilterApplied 
                                            && activeTags.indexOf(tag) >= 0 
                                            ? "highlight" : ""
                                        }
                                    `}
                                />
                            )
                        }
                    </div>
                </TagsContainer>


                {/* {filters.years &&
                    <div className="w-full mt-2 bg-gray-700">
                        <RangePicker 
                            minLabel="Start Year"
                            minOptions={[
                                { label: "Lowest", value: "" }, 
                                ...createRangeValues(
                                    (filters?.years?.start || 1996), 
                                    Number(yearQuery?.end) || new Date().getFullYear()
                                )
                            ]} 
                            maxLabel="End Year"
                            maxOptions={[
                                { label: "Highest", value: "" }, 
                                ...createRangeValues(
                                    Number(yearQuery?.start) || 1996, 
                                    new Date().getFullYear()
                                )
                            ]} 
                            onMinChange={(e) => onYearRangeChanged(e, "lowest")}
                            onMaxChange={(e) => onYearRangeChanged(e, "highest")}

                            minValue={(router.query.yearlowest || "") as string}
                            maxValue={(router.query.yearhighest || "") as string}
                        />
                    </div>
                } */}


                <TagsContainer title="Authors" queryKey="authors" activeTags={queryAuthors}>
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
