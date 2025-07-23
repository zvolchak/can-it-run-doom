import { getMainLayout } from "@/src/layouts"
import { 
    IArchiveItem,
} from "@/src/types"
import {
    MultirowCategoryContainer,
} from "@/src/components"
import React, { useEffect, useState } from "react"
import Slider from "react-slick"
import { useRouter } from "next/router"
import { redirectToEntries } from "@/src/utils"

interface IMainPageProps {
    items: IArchiveItem[]
    className?: string
}


const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 2,
    initialSlide: 0,
    adaptiveHeight: true,
    centerMode: true,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 2,
                infinite: true,
                dots: true
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                initialSlide: 2
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                centerPadding: "23px",
                arrows: false,
            }
        }
    ]
}


export function GrouppedMiniShowcase({ items, className = "" }: IMainPageProps) {
    const router = useRouter()

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    function itemsWithSourceCode() {
        return items.filter(
            (item: IArchiveItem) => item.sourceCodeUrl?.length > 0
        )
    }

    function randomizeItems(target: IArchiveItem[]) {
        return [...target].sort(() => Math.random() - 0.5)
    }


    return (
        <div className={`${className}`}>
            { isClient &&
            <Slider {...settings}>
                <MultirowCategoryContainer
                    className="" 
                    items={randomizeItems(itemsWithSourceCode()).splice(0, 4)}
                    title="Source Code Enthusiasts"
                    onMoreClicked={() => { redirectToEntries(router, "hasCode", "true") }}
                />
                <MultirowCategoryContainer
                    className="" 
                    items={randomizeItems(itemsWithSourceCode()).splice(0, 4)}
                    title="First Level Completed"
                    onMoreClicked={() => redirectToEntries(router, "levelCompleted", "true")}
                />

                <MultirowCategoryContainer
                    className="" 
                    items={randomizeItems(itemsWithSourceCode()).splice(0, 4)}
                    title="Collaborators"
                    onMoreClicked={() => redirectToEntries(router, "authorsPerItem", "10")}
                />
            </Slider>
            }
        </div>
    )
} // MainPage


GrouppedMiniShowcase.getLayout = getMainLayout
