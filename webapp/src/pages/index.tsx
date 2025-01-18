import { useRouter } from "next/router"
import type { GetServerSideProps } from 'next'
import { IArchiveItem } from "@/src/types"
import {
    Navbar,
    Tag,
    ItemCard,
} from "@/src/components"
import {
    fetchArchiveData,
} from "@/src/api"

interface IMainPageProps {
    items: IArchiveItem[]
}

function MainPage({ items }: IMainPageProps) {
    const router = useRouter()

    const tags = Array.from(new Set(items.flatMap(item => item.tags)))
    const filterQuery = router.query
    const queryTags = (decodeURIComponent(filterQuery.tag as string)).split(",")

    function filterItems() {
        let filtered = [ ...items ]
        if (filterQuery.tag) {
            // filtered = filtered.filter((item) => item.tags.indexOf(filterQuery.tag as string) >= 0)
            filtered = filtered.filter(item =>
                item.tags.some(tag => queryTags.includes(tag)))
        }
        return filtered
    }
    
    const filteredItems = filterItems()

    return (
        <div className="">
            <Navbar />
            <div className="flex flex-wrap flex-row gap-1 mt-3 p-4">
                {
                    tags.map((tag: string) =>
                        <Tag 
                            key={`tag_${tag}`} 
                            text={tag} 
                            active={queryTags.indexOf(tag) >= 0} 
                        />
                    )
                }
            </div>

            <div className="grid content-center justify-center gap-6 mt-5">
                {/* <div className="flex flex-col bg-slate-400"> hello </div>
                <div className="flex flex-col bg-slate-400 w-full"> hello </div> */}
                {
                    filteredItems.map((item: IArchiveItem) => 
                        <ItemCard 
                            key={`doom port item for ${item.title}`} item={item} 
                            className="justify-self-center"
                        />
                    )
                }
            </div>
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
