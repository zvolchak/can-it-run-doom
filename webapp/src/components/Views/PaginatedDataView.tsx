import { getMainLayout } from "@/src/layouts"
import { 
    IArchiveItem,
} from "@/src/types"
import {
    BtnScrollPage,
    CategoryContainer,
    LazyLoader,
    ArchiveDataView,
} from "@/src/components"
import { useRouter } from "next/router"
import { redirectToEntries, sortDscOrAsc } from "@/src/utils"

interface IMainPageProps {
    items: IArchiveItem[]
}


export function PaginatedDataView({ items }: IMainPageProps) {
    const router = useRouter()

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

    const baremetalItems = items.filter(
        (item: IArchiveItem) => item.tags.includes("baremetal")
    ).splice(0, 15)

    return (
        <div className="archive-data-view">
            <div className="flex flex-col gap-10">
                <ArchiveDataView items={items} />

                <LazyLoader>
                  <CategoryContainer
                      items={sortDscOrAsc(items).slice(0, 10)}
                      title="Latest Submissions"
                      onMoreClicked={() => redirectToEntries(router, { sort: "latest", limit: 10 })}
                  />
                </LazyLoader>

                <LazyLoader>
                  <CategoryContainer
                      items={baremetalItems}
                      title="Baremetal"
                      onMoreClicked={() => redirectToEntries(router, { tag: "baremetal" })}
                  />
                </LazyLoader>
            </div>

            <BtnScrollPage className="bottom-5 sm:bottom-[5rem] right-10 fixed z-10" />
        </div>
    )
} // PaginatedDataView


PaginatedDataView.getLayout = getMainLayout
