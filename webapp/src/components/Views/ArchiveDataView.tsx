import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { getMainLayout } from "@/src/layouts"
import { 
    IArchiveItem,
    IFiltersStoreState,
} from "@/src/types"
import {
    ItemCard,
    BtnScrollTop,
    Pagination,
    FiltersMenu,
} from "@/src/components"
import {
    paginate,
    onSearch,
    filterById,
    filterItemsByTags,
    filterItemsByAuthors,
} from "@/src/utils"
import { 
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
}) {
    if (searchQuery && searchQuery !== "")
        items = onSearch(items, searchQuery)
    if (authorQuery && authorQuery.length > 0)
        items = filterItemsByAuthors(items, authorQuery)
    if (idQuery && idQuery.length > 0)
        items = filterById(items, idQuery)
    if (queryTags && queryTags.length > 0)
        items = filterItemsByTags(items, queryTags)

    if (yearQuery?.start || yearQuery?.end) {
        items = items?.filter((item: IArchiveItem) => {
            const itemYear = new Date(item.publishDate).getFullYear()
            const endYear = Number(yearQuery.end) || new Date().getFullYear()
            return itemYear >= Number(yearQuery.start) && itemYear <= endYear
        }) || []
    }
    return items
} // filterItems


export function ArchiveDataView({ items }: IMainPageProps) {
    const dispatch = useDispatch()
    const itemsPerPage = 20

    const filters: IFiltersStoreState = useSelector((state: RootState) => state.appliedFilters)
    const filteredItems: IArchiveItem[] = useSelector((state: RootState) => state.submissions.filtered)
    // const totalItemsSize: number = useSelector((state: RootState) => state.submissions.totalSize)
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
        })

        const pages = Math.ceil(filtered.length / itemsPerPage)
        setNumberOfPages(pages)
        filtered = paginate(filtered, currentPage - 1, itemsPerPage)

        dispatch(setItems(items))
        dispatch(setFiltered(filtered))
    }, [items, filters, dispatch, setNumberOfPages, currentPage])

    if (!items || items?.length === 0) {
        return (
            <div className="
                h-screen w-full justify-center mt-10 flex flex-row text-center text-white
                "
            >
                Not items found. If this error persists, please contact support 
            through Discord channel or email.
            </div>
        )
    }


    return (
        <div className="archive-data-view">
            <div className="h-10">
                <Pagination 
                    currentPage={currentPage} 
                    numberOfPages={numberOfPages} 
                    className="my-4"
                />
            </div>

            <FiltersMenu />

            <div className="
                min-h-screen
                grid content-start justify-center gap-14 mt-5
                sm:gap-6"
            >
                {
                    filteredItems.map((item: IArchiveItem) => 
                        <ItemCard 
                            key={`doom port item for ${item.title}`} item={item} 
                            className="justify-self-center px-4"
                        />
                    )
                }
            </div>

            <Pagination 
                currentPage={currentPage} 
                numberOfPages={numberOfPages} 
                className="my-8"
            />

            <BtnScrollTop className="bottom-5 sm:bottom-10 right-10 fixed z-10" />
        </div>
    )
} // MainPage


ArchiveDataView.getLayout = getMainLayout
