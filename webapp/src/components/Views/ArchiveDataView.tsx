import { useRouter } from "next/router"
import { IArchiveItem } from "@/src/types"
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
    paginate,
    getTagsFromItems,
} from "@/src/utils"


interface IMainPageProps {
    items: IArchiveItem[]
    tags: string[]
}


export function ArchiveDataView({ items, tags }: IMainPageProps) {
    const router = useRouter()
    const queryTags = (decodeURIComponent(router.query?.tag as string || "")).split(",")
            .filter(q => q || q !== "")
    const currentPage = Number(router.query?.page || 0)
    const itemsPerPage = 15

    if (!items) {
        return (
            <div>Not items found. If this error persists, please contact support 
            through Discord channel or email.</div>
        )
    }

    let filteredItems = [...items]

    const activeTags = filteredItems.length !== items.length ? getTagsFromItems(filteredItems) : []
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
