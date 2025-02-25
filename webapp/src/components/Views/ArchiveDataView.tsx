import { useRouter } from "next/router"
import { IArchiveItem, } from "@/src/types"
import {
    ItemCard,
    BtnScrollTop,
    Pagination,
    FiltersMenu,
} from "@/src/components"
import {
    paginate,
} from "@/src/utils"
import { getMainLayout } from "@/src/layouts"


interface IMainPageProps {
    items: IArchiveItem[]
}


export function ArchiveDataView({ items }: IMainPageProps) {
    const router = useRouter()
    const currentPage = Number(router.query?.page || 0)
    const itemsPerPage = 10
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

    let filteredItems = [...items]

    const numberOfPages = Math.ceil(filteredItems.length / itemsPerPage)
    filteredItems = paginate(filteredItems, currentPage, itemsPerPage)

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
