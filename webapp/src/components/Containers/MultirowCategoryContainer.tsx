import { getMainLayout } from "@/src/layouts"
import {
    PreviewTitleWithBtn,
} from "@/src/components"
import React from "react"


interface IMainPageProps {
    title: string,
    className?: string,
    onMoreClicked?: () => void,
    children?: any
}


export function MultirowCategoryContainer({ 
    title,
    className="",
    onMoreClicked = null,
    children = null,
}: IMainPageProps) {
    return (
        <div className={`${className} mx-0 sm:mx-10`}
        >
            <PreviewTitleWithBtn
                title={title}
                label="More"
                onClick={onMoreClicked}
                className="text-m px-4 sm:px-1"
            />

            <div className="
                grid grid-rows-2 grid-flow-col gap-1 
                sm:flex sm:flex-row sm:flex-wrap sm:gap-3
                place-content-center
                "
            >
                {children}
            </div>
        </div>
    )
} // MainPage


MultirowCategoryContainer.getLayout = getMainLayout
