import { getMainLayout } from "@/src/layouts"
import { 
    IArchiveItem,
} from "@/src/types"
import {
    BtnScrollPage,
    CategoryContainer,
    GrouppedMiniShowcase,
    LazyLoader,
} from "@/src/components"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import {
    redirectToEntries,
    sortDscOrAsc,
} from "@/src/utils"

interface IMainPageProps {
    items: IArchiveItem[]
}


export function MiniCategorizedView({ items }: IMainPageProps) {
    const router = useRouter()
    const [randomItems, setRandomItems] = useState<IArchiveItem[]>([])

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


    return (
        <div className="archive-discovery">
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

            <BtnScrollPage 
              direction="top" 
              className="bottom-5 sm:bottom-[5rem] right-10 fixed z-10" 
            />
        </div>
    )
} // MainPage


MiniCategorizedView.getLayout = getMainLayout
