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
    const searchQuery = decodeURIComponent(router.query?.search as string || "")
    const idQuery = decodeURIComponent(router.query?.id as string || "").split(",")
            .filter(q => q || q !== "")
    const currentPage = Number(router.query?.page || 0)
    const itemsPerPage = 15


    useEffect(() => {
        dispatch(setItems(items))
    }, [dispatch, items])


    if (!items) {
        return (
            <div>Not items found. If this error persists, please contact support 
            through Discord channel or email.</div>
        )
    }


    function flattenAndSortTags(targetItems: IArchiveItem[]): string[] {
        if (!targetItems)
            return []

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


    function filterById(targetItems: IArchiveItem[], ids: string[]) {
        return targetItems.filter((item: IArchiveItem) => ids.indexOf(item.id) >= 0)
    }

    let filteredItems = [...items]
    if (idQuery && idQuery.length > 0)
        filteredItems = filterById([...items], idQuery)
    else {
        filteredItems = filterBySearch([...items], searchQuery)
        filteredItems = filterItemsByTags(filteredItems, queryTags)
    }

    const activeTags = filteredItems.length !== items.length ? getTagsInFilteredItems(filteredItems) : []
    const numberOfPages = Math.ceil(filteredItems.length / itemsPerPage)
    filteredItems = paginate(filteredItems, currentPage, itemsPerPage)

    return (
        <div className="">
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
            <Footer className="mt-20" />
        </div>
    )
} // MainPage


export const getServerSideProps: GetServerSideProps = async () => {
    const items: IArchiveItem[] = await fetchArchiveData({})
    // FIXME: move sorting to backend
    items.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    return {
      props: {
        items,
      },
    }
} // getServerSideProps


export default MainPage
