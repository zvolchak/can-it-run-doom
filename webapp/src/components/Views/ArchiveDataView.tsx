import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { getMainLayout } from "@/src/layouts"
import { 
    IArchiveItem,
    IFiltersStoreState,
} from "@/src/types"
import {
    ItemCard,
    Pagination,
    FiltersMenu,
} from "@/src/components"
import {
    paginate,
    onSearch,
    filterById,
    filterItemsByTags,
    filterItemsByAuthors,
    sortDscOrAsc,
    filterItemsByLvlCompleted,
    filterBySourceCode,
    filterByAuthorsPerItem,
    stringToBoolOrNull,
} from "@/src/utils"
import { 
    isFilterApplied,
    RootState,
    setFiltered,
    setItems,
} from "@/src/store"


interface IMainPageProps {
    items: IArchiveItem[]
}


function filterItems({
    items,
    searchQuery,
    queryTags,
    idQuery,
    authorQuery,
    yearQuery,
    query,
}): IArchiveItem[] {
    let filtered = [ ...items ]
    if (query?.levelCompleted)
        filtered = filterItemsByLvlCompleted(filtered, stringToBoolOrNull(query.levelCompleted))
    if (searchQuery && searchQuery !== "")
        filtered = onSearch(filtered, searchQuery)
    if (authorQuery && authorQuery.length > 0)
        filtered = filterItemsByAuthors(filtered, authorQuery)
    if (idQuery && idQuery.length > 0)
        filtered = filterById(filtered, idQuery)
    if (queryTags && queryTags.length > 0)
        filtered = filterItemsByTags(filtered, queryTags)

    if (query?.authorsPerItem)
        filtered = filterByAuthorsPerItem(filtered, Number(query.authorsPerItem))
    if (query?.hasCode)
        filtered = filterBySourceCode(filtered, stringToBoolOrNull(query.hasCode))
    
    if (query?.sort)
        filtered = sortDscOrAsc(filtered, query.sort)
    if (query?.limit)
        filtered = filtered.slice(0, query.limit)

    if (yearQuery?.start || yearQuery?.end) {
        filtered = filtered?.filter((item: IArchiveItem) => {
            const itemYear = new Date(item.publishDate).getFullYear()
            const endYear = Number(yearQuery.end) || new Date().getFullYear()
            return itemYear >= Number(yearQuery.start) && itemYear <= endYear
        }) || []
    }
    return filtered
} // filterItems


export function ArchiveDataView({ items }: IMainPageProps) {
    const dispatch = useDispatch()
    const itemsPerPage = 10

    const filters: IFiltersStoreState = useSelector((state: RootState) => state.appliedFilters)
    const filteredItems: IArchiveItem[] = useSelector((state: RootState) => state.submissions.filtered)
    const currentPage = filters.page || 1
    const [numberOfPages, setNumberOfPages] = useState(Math.ceil(filteredItems.length / itemsPerPage))

    useEffect(() => {
        let filtered = filterItems({
            items: items,
            searchQuery: filters.searchString,
            queryTags: filters.tags,
            idQuery: filters.ids,
            authorQuery: filters.authors,
            yearQuery: filters.years,
            query: filters.query,
        })

        const pages = Math.ceil(filtered.length / itemsPerPage)
        setNumberOfPages(pages)
        filtered = paginate(filtered, currentPage - 1, itemsPerPage)

        dispatch(setItems(items))
        dispatch(setFiltered(filtered))
    }, [items, filters, dispatch, setNumberOfPages, currentPage])


    if (!items || items?.length === 0) {
        return (
            <div>
                <div className="
                    h-screen w-full justify-center mt-10 flex flex-row text-center text-white
                    "
                >
                    No items found. If this error persists, please contact support 
                through Discord channel or email.
                </div>
            </div>
        )
    }


    return (
        <div className="archive-data-view flex flex-col">
            <div className="h-10">
                <Pagination 
                    currentPage={currentPage} 
                    numberOfPages={numberOfPages} 
                    className="my-4"
                />
            </div>

            <FiltersMenu />

            <div className="
                grid content-start justify-center gap-14 mt-5
                sm:gap-6"
            >
                {
                    filteredItems.map((item: IArchiveItem) => 
                        <ItemCard 
                            key={`doom port item for ${item.title}`} item={item} 
                            className="justify-self-center px-4 sm:w-[40rem]"
                        />
                    )
                }
            </div>

            <Pagination 
                currentPage={currentPage} 
                numberOfPages={numberOfPages} 
                className="my-8"
            />

        </div>
    )
} // MainPage


ArchiveDataView.getLayout = getMainLayout
