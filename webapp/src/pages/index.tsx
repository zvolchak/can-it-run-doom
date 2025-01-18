import { useRouter } from "next/router"
import type { GetServerSideProps } from 'next'
import { IArchiveItem } from "@/src/types"
import {
    Navbar,
    Tag,
    ItemCard,
    BtnScrollTop,
} from "@/src/components"
import {
    fetchArchiveData,
} from "@/src/api"

interface IMainPageProps {
    items: IArchiveItem[]
}

function MainPage({ items }: IMainPageProps) {
    const router = useRouter()

    const tags = flattenAndSortTags(items)

    const filterQuery = router.query
    const queryTags = (decodeURIComponent(filterQuery.tag as string)).split(",")

    function flattenAndSortTags(targetItems: IArchiveItem[]): string[] {
        const flattened = targetItems.flatMap(item => item.tags)
    
        const frequency = flattened.reduce((map, tag) => {
            map.set(tag, (map.get(tag) || 0) + 1)
            return map
        }, new Map<string, number>())
    
        const sorted = Array.from(frequency.entries()).sort((a, b) => b[1] - a[1])
    
        return sorted.map(([tag]) => tag)
    } // flattenAndSortTags


    function filterItems(itemsToFilter: IArchiveItem[], query) {
        if (!query.tag)
            return itemsToFilter;

        return itemsToFilter.filter(item =>
            item.tags.some(tag => query.tag.includes(tag)))
    } // filterItems
    

    function getTagsInFilteredItems(targetItems: IArchiveItem[]) {
        const uniqueTags = Array.from(
            new Set(targetItems.flatMap(item => item.tags))
        )
        return uniqueTags
    } // tagsInFilteredItems


    const filteredItems = filterItems([...items], filterQuery)
    const activeTags = filteredItems.length !== items.length ? getTagsInFilteredItems(filteredItems) : []

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

            <div className="grid content-center justify-center gap-14 sm:gap-6 mt-5">
                {
                    filteredItems.map((item: IArchiveItem) => 
                        <ItemCard 
                            key={`doom port item for ${item.title}`} item={item} 
                            className="justify-self-center px-4"
                        />
                    )
                }
            </div>

            <BtnScrollTop className="bottom-10 right-10 fixed" />
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
