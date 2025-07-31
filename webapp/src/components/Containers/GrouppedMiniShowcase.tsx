import { getMainLayout } from "@/src/layouts"
import { 
    IArchiveItem,
} from "@/src/types"
import {
    MultirowCategoryContainer,
    ItemsCollection,
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
                slidesToShow: 1,
                slidesToScroll: 1,
                centerPadding: "24px",
            }
        },
        {
            breakpoint: 800,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                centerPadding: "20px",
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                centerPadding: "17px",
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

    function itemsWithSourceCode(): IArchiveItem[] {
        const filtered = items.filter(
            (item: IArchiveItem) => item.sourceCodeUrl?.length > 0
        )
        return randomizeItems(filtered).splice(0, 4)
    }


    function itemsWithCompletedLevel(): IArchiveItem[] {
        const filtered = items.filter(
            (item: IArchiveItem) => item.isFirstLevelComplete
        )
        return randomizeItems(filtered).splice(0, 4)   
    } // itemsWithCompletedLevel


    function itemsWithMoreThanOneAuthor(): IArchiveItem[] {
        const filtered = items.filter(
            (item: IArchiveItem) => item?.authors?.length > 1
        )
        return randomizeItems(filtered).splice(0, 4)   
    } // itemsWithMoreThanOneAuthor


    function randomizeItems(target: IArchiveItem[]) {
        return [...target].sort(() => Math.random() - 0.5)
    }


    return (
        <div className={`${className}`}>
            { isClient &&
            <Slider {...settings}>
                <MultirowCategoryContainer
                    className="" 
                    title="Source Code Enthusiasts"
                    onMoreClicked={() => { redirectToEntries(router, { hasCode: "true" }) }}
                >
                    <ItemsCollection
                        collection="sourceCodeEnthusiasts"
                        compute={itemsWithSourceCode}
                    />
                </MultirowCategoryContainer>

                <MultirowCategoryContainer
                    className="" 
                    title="First Level Completed"
                    onMoreClicked={() => redirectToEntries(router, { levelCompleted: "true" })}
                >
                    <ItemsCollection
                        collection="levelCompleted"
                        compute={itemsWithCompletedLevel}
                    />
                </MultirowCategoryContainer>

                <MultirowCategoryContainer
                    className="" 
                    title="Collaborators"
                    onMoreClicked={() => redirectToEntries(router, { authorsPerItem: "10" })}
                >
                    <ItemsCollection
                        collection="moreThanOneAuthor"
                        compute={itemsWithMoreThanOneAuthor}
                    />
                </MultirowCategoryContainer>
            </Slider>
            }
        </div>
    )
} // MainPage


GrouppedMiniShowcase.getLayout = getMainLayout
