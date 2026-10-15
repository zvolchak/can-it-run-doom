import { getMainLayout } from "@/src/layouts"
import { 
    IArchiveItem,
} from "@/src/types"
import {
    BtnScrollPage,
    CategoryContainer,
    GrouppedMiniShowcase,
    ItemPreviewModal,
    LazyLoader,
} from "@/src/components"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
    RootState,
    setAvailableAuthors,
    setAvailableTags,
    setAvailableYears,
    setItems,
} from "@/src/store"
import { useRouter } from "next/router"
import {
    getAuthorsFromItems,
    getTagsFromItems,
    getYearsFromItems,
    redirectToEntries,
    sortDscOrAsc,
} from "@/src/utils"

interface IMainPageProps {
    items: IArchiveItem[]
}


export function MiniCategorizedView({ items }: IMainPageProps) {
    const router = useRouter()
    const dispatch = useDispatch()
    const selectedItem: IArchiveItem = useSelector((state: RootState) => state.submissions.selected)
    const [randomItems, setRandomItems] = useState<IArchiveItem[]>([])

    useEffect(() => {
        dispatch(setItems(items))
        dispatch(setAvailableTags(getTagsFromItems(items)))
        dispatch(setAvailableAuthors(getAuthorsFromItems(items).sort()))
        dispatch(setAvailableYears(getYearsFromItems(items)))

        const picks = [...items]
            .sort(() => Math.random() - 0.5)
            .slice(0, 10)
        setRandomItems(picks)
    }, [dispatch, items])


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


    function otherItems() {
        return items.filter((item: IArchiveItem) => !item.tags.includes("baremetal"))
    } // otherItems


    const baremetalItems = items.filter(
        (item: IArchiveItem) => item.tags.includes("baremetal")
    ).splice(0, 15)


    return (
        <div className="archive-data-view">
            <div className="flex flex-col gap-10">
                <LazyLoader>
                    <CategoryContainer
                        items={randomItems}
                        title="All Ports"
                        btnTitle="See All"
                        onMoreClicked={() => redirectToEntries(router)}
                    />
                </LazyLoader>

                <LazyLoader className="my-8 py-4 bg-slate-800">
                  <CategoryContainer
                      items={sortDscOrAsc(items).splice(0, 10)}
                      title="Latest Submissions"
                      onMoreClicked={() => redirectToEntries(router, { sort: "latest", limit: 10 })}
                  />
                </LazyLoader>
                
                <LazyLoader className="my-8 py-4 bg-slate-800">
                    <GrouppedMiniShowcase 
                        items={items}
                    />
                </LazyLoader>
            </div>

            <ItemPreviewModal item={selectedItem} />

            <BtnScrollPage 
              direction="top" 
              className="bottom-5 sm:bottom-[5rem] right-10 fixed z-10" 
            />
        </div>
    )
} // MainPage


MiniCategorizedView.getLayout = getMainLayout
