import { getMainLayout } from "@/src/layouts"
import { 
    IArchiveItem,
} from "@/src/types"
import {
    BtnScrollTop,
    CategoryContainer,
    GrouppedMiniShowcase,
    ItemPreviewModal,
    LazyLoader,
} from "@/src/components"
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState, setAppliedAuthors, setAppliedSearch, setAppliedTags, setAppliedYears, } from "@/src/store"
import { useRouter } from "next/router"
import { redirectToEntries, sortDscOrAsc } from "@/src/utils"

interface IMainPageProps {
    items: IArchiveItem[]
}


export function CategorizedDataView({ items }: IMainPageProps) {
    const router = useRouter()
    const dispatch = useDispatch()
    const selectedItem: IArchiveItem = useSelector((state: RootState) => state.submissions.selected)
    const [randomItems, setRandomItems] = useState<IArchiveItem[]>([])

    // Reset filters on this page
    dispatch(setAppliedTags([]))
    dispatch(setAppliedAuthors([]))
    dispatch(setAppliedSearch(""))
    dispatch(setAppliedYears(null))

    useEffect(() => {
        const picks = [...items]
            .sort(() => Math.random() - 0.5)
            .slice(0, 10)
        setRandomItems(picks)
    }, [items])


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
                <CategoryContainer
                    items={sortDscOrAsc(items).splice(0, 10)}
                    title="Latest Submissions"
                    onMoreClicked={() => redirectToEntries(router, { sort: "latest", limit: 10 })}
                />
                
                <CategoryContainer
                    items={baremetalItems}
                    title="Baremetal"
                    onMoreClicked={() => redirectToEntries(router, { tag: "baremetal" })}
                />

                <LazyLoader className="my-8 py-4 bg-slate-800">
                    <GrouppedMiniShowcase 
                        items={items}
                    />
                </LazyLoader>

                <LazyLoader>
                    <CategoryContainer
                        items={otherItems().splice(0, 10)}
                        title="Other"
                        onMoreClicked={() => redirectToEntries(router, { tag: "!baremetal" })}
                    />
                </LazyLoader>

                <LazyLoader>
                    <CategoryContainer
                        items={randomItems}
                        title="All Ports"
                        btnTitle="See All"
                        onMoreClicked={() => redirectToEntries(router)}
                    />
                </LazyLoader>
            </div>

            <ItemPreviewModal item={selectedItem} />

            <BtnScrollTop className="bottom-5 sm:bottom-[5rem] right-10 fixed z-10" />
        </div>
    )
} // MainPage


CategorizedDataView.getLayout = getMainLayout
