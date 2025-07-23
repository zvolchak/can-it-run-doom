import { getMainLayout } from "@/src/layouts"
import { 
    IArchiveItem,
} from "@/src/types"
import {
    ItemCardMini,
    PreviewTitleWithBtn,
} from "@/src/components"
import React from "react"


interface IMainPageProps {
    items: IArchiveItem[],
    title: string,
    className?: string,
    onMoreClicked?: () => void,
}


export function MultirowCategoryContainer({ 
    items, 
    title,
    className="",
    onMoreClicked = null,
}: IMainPageProps) {
    const maxTitleLength = 80

    return (
        <div className={`${className} mx-0 sm:mx-10`}
        >
            <PreviewTitleWithBtn
                title={title}
                label="More"
                onClick={onMoreClicked}
                className="text-m"
            />

            <div className="
                grid grid-rows-2 grid-flow-col gap-1 
                sm:flex sm:flex-row sm:flex-wrap sm:gap-3
                place-content-center
                "
            >
                {
                    items.map((item: IArchiveItem) => 
                        <ItemCardMini 
                            key={`doom port item for ${item.title}`} item={item} 
                            className="
                                item flex flex-col text-slate-50 gap-0 
                                w-40
                            "
                        >
                            <div className="text-sm h-16">
                                {item.title.slice(0,maxTitleLength).trim()}
                                {item.title.length > maxTitleLength ? "..." : ""}
                            </div>
                        </ItemCardMini>
                    )
                }
            </div>
        </div>
    )
} // MainPage


MultirowCategoryContainer.getLayout = getMainLayout
