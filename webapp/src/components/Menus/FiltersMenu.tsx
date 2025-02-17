"use client"
import React, { useRef, } from 'react'
import { useRouter, } from "next/router"
import { useSelector, useDispatch, } from "react-redux"
import { FaRegWindowClose } from "react-icons/fa"
import {
    IArchiveItem,
    IFiltersStoreState,
    ISettingsStoreState,
} from "@/src/types"
import { 
    RootState,
    setIsFiltersMenu,
} from "@/src/store"
import {
    Tag,
    RangePicker,
    TagsContainer,
} from "@/src/components"
import {
    getTagsFromItems,
    getValueFromQuery,
    getAuthorsFromItems,
} from "@/src/utils"


export const FiltersMenu = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const filters: IFiltersStoreState = useSelector((state: RootState) => state.availableFilters)
    const items: IArchiveItem[] = useSelector((state: RootState) => state.submissions.items)
    const settings: ISettingsStoreState = useSelector((state: RootState) => state.settings)
    const menuRef = useRef(null)

    const queryTags = getValueFromQuery(router.query, "tag")
    const queryAuthors = getValueFromQuery(router.query, "author")
    const yearQuery = {
        lowest: getValueFromQuery(router.query, "yearlowest")[0] || 1996, 
        highest: getValueFromQuery(router.query, "yearhighest")[0] || new Date().getFullYear(),
    }

    const isTagsHighlight = Object.keys(router.query).length > 0 
    const activeTags = isTagsHighlight ? getTagsFromItems(items) : []
    const activeAuthors = isTagsHighlight ? getAuthorsFromItems(items) : []

    function onYearRangeChanged(value: string, yearType: string) {
        const query = router.query
        const keyName = `year${yearType}`
        if (!Number(value) || query[keyName] === value)
            delete query[`year${yearType}`]
        else
            query[keyName] = value

        router.push({
            pathname: router.pathname,
            query,
        }, undefined, { scroll: false })
    } // onYearRangeChanged
    
 
    function createRangeValues(start: number, end: number) {
        const result = filters.years.filter(i => i >= start && i <= end)
            .map(i => ({ value: i.toString(), label: i.toString() }))
        return result
    } // createSequenceValues


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

                <TagsContainer title="Tags" queryKey="tag" activeTags={activeTags}>
                    <div className="tags-container scroll-slate flex flex-row flex-wrap gap-2 pt-5 px-4 pb-10">
                        {
                            filters.tags.map((tag: string) =>
                                <Tag 
                                    key={`tag_${tag}`} 
                                    text={`#${tag}`} 
                                    queryKey="tag"
                                    className={`
                                        ${queryTags.indexOf(tag) >= 0 ? "active" : ""}
                                        ${queryTags.indexOf(tag) < 0 && activeTags.indexOf(tag) >= 0 ? "highlight" : ""}
                                    `}
                                />
                            )
                        }
                    </div>
                </TagsContainer>


                {filters.years &&
                    <div className="w-full mt-2 bg-gray-700">
                        <RangePicker 
                            minLabel="Start Year"
                            minOptions={[
                                { label: "Lowest", value: "" }, 
                                ...createRangeValues((filters?.years?.[0] || 1996), Number(yearQuery.highest))
                            ]} 
                            maxLabel="End Year"
                            maxOptions={[
                                { label: "Highest", value: "" }, 
                                ...createRangeValues(Number(yearQuery.lowest) || 1996, new Date().getFullYear())
                            ]} 
                            onMinChange={(e) => onYearRangeChanged(e, "lowest")}
                            onMaxChange={(e) => onYearRangeChanged(e, "highest")}

                            minValue={(router.query.yearlowest || "") as string}
                            maxValue={(router.query.yearhighest || "") as string}
                        />
                    </div>
                }


                <TagsContainer title="Authors" queryKey="author" activeTags={queryAuthors}>
                    <div className="tags-container scroll-slate flex flex-row flex-wrap gap-2 pt-5 px-4 pb-10">
                        {
                            filters.authors.map((author: string) =>
                                <Tag 
                                    key={`author_${author}`} 
                                    text={author} 
                                    queryKey="author"
                                    className={`
                                        ${queryAuthors.indexOf(author) >= 0 ? "active" : ""}
                                        ${queryAuthors.indexOf(author) < 0 && activeAuthors.indexOf(author) >= 0 ? "highlight" : ""}
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
