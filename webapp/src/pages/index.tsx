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

    const tags = Array.from(new Set(items.flatMap(item => item.tags)))
    // function getAllTags() {
    //     // FIXME: When switching pages, tags change according to current page items.
    //     // This solution is dumb. Won't work for filtered items with more than 1 page.
    //     // But good enough for now.
    //     const target = currentSearch.value ? filtered.value : items.value
    //     const tags = getAllTagsFromItems(target).splice(0, numberOfTagsPreview.value)
    //     return getTagsFromString(tags, currentSearch.value)
    //   } // getAllTags

    return (
        <div className="">
            <Navbar />
            <div className="flex flex-wrap flex-row gap-1 mt-3 p-4">
                {
                    tags.map((tag: string) => {
                        return <Tag key={`tag_${tag}`} text={tag} active={false} />
                    })
                }
            </div>

            <div className="flex flex-col gap-6 justify-items-center mt-5">
                {
                    items.map((item: IArchiveItem) => 
                        <ItemCard key={`doom port item for ${item.title}`} item={item} />
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
