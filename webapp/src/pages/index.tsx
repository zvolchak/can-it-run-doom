import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/router"
import type { GetServerSideProps } from 'next'
import { IArchiveItem } from "@/src/types"
import {
    setItems,
} from "@/src/store"
import {
    Navbar,
    Tag,
    ItemCard,
    BtnScrollTop,
    Pagination,
    Footer,
    BtnClearFilters,
} from "@/src/components"
import {
    fetchArchiveData,
} from "@/src/api"
import {
    onSearch,
    paginate,
} from "@/src/utils"


interface IMainPageProps {
    items: IArchiveItem[]
}


function MainPage({ items }: IMainPageProps) {
    const router = useRouter()
    const dispatch = useDispatch()
    const tags = flattenAndSortTags(items)
    const queryTags = (decodeURIComponent(router.query?.tag as string || "")).split(",")
            .filter(q => q || q !== "")
    const searchQuery = (decodeURIComponent(router.query?.search as string || ""))
    const currentPage = Number(router.query?.page || 0)
    const itemsPerPage = 15


    useEffect(() => {
        dispatch(setItems(items))
    }, [dispatch, items])


    function flattenAndSortTags(targetItems: IArchiveItem[]): string[] {
        const flattened = targetItems.flatMap(item => item.tags)
    
        const frequency = flattened.reduce((map, tag) => {
            map.set(tag, (map.get(tag) || 0) + 1)
            return map
        }, new Map<string, number>())
    
        const sorted = Array.from(frequency.entries()).sort((a, b) => b[1] - a[1])
    
        return sorted.map(([tag]) => tag)
    } // flattenAndSortTags


    function filterBySearch(itemsToFilter: IArchiveItem[], query) {
        if (!query || query === "")
            return itemsToFilter
        return onSearch(query, itemsToFilter)
    }


    function filterItemsByTags(itemsToFilter: IArchiveItem[], query) {
        if (!query || query.length == 0)
            return itemsToFilter

        return itemsToFilter.filter(item =>
            item.tags.some(tag => query.includes(tag)))
    } // filterItems
    

    function getTagsInFilteredItems(targetItems: IArchiveItem[]) {
        const uniqueTags = Array.from(
            new Set(targetItems.flatMap(item => item.tags))
        )
        return uniqueTags
    } // tagsInFilteredItems


    let filteredItems = filterBySearch([...items], searchQuery)
    filteredItems = filterItemsByTags(filteredItems, queryTags)

    const activeTags = filteredItems.length !== items.length ? getTagsInFilteredItems(filteredItems) : []
    const numberOfPages = Math.ceil(filteredItems.length / itemsPerPage)

    // FIXME: move sorting to backend
    filteredItems.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())

    const paginatedItems = paginate(filteredItems, currentPage, itemsPerPage)


    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="flex flex-wrap flex-row gap-2 mt-3 p-4">
                {
                    tags.map((tag: string) =>
                        <Tag 
                            key={`tag_${tag}`} 
                            text={tag} 
                            className={`
                                ${queryTags.indexOf(tag) >= 0 ? "active" : ""}
                                ${queryTags.indexOf(tag) < 0 && activeTags.indexOf(tag) >= 0 ? "highlight" : ""}
                            `}
                        />
                    )
                }
            </div>

            {Object.keys(router.query).length > 0 &&
                <div className="h-2 px-4">
                    <BtnClearFilters />
                </div>
            }

            <div className="h-10">
                <Pagination 
                    currentPage={currentPage} 
                    numberOfPages={numberOfPages} 
                    className="my-4"
                />
            </div>

            <div className="
                grid content-center justify-center gap-14 mt-5
                sm:gap-6"
            >
                {
                    paginatedItems.map((item: IArchiveItem) => 
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


            <Footer className="mt-20" />
            <BtnScrollTop className="bottom-5 sm:bottom-10 right-10 fixed" />
        </div>
    )
} // MainPage


export const getServerSideProps: GetServerSideProps = async () => {
    const items: IArchiveItem = await fetchArchiveData({})
    return {
      props: {
        items,
      },
    }
} // getServerSideProps


export default MainPage
