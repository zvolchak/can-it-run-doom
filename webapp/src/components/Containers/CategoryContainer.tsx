import { getMainLayout } from "@/src/layouts"
import { 
    IArchiveItem,
} from "@/src/types"
import {
    ItemCardSimple,
    PreviewTitleWithBtn,
} from "@/src/components"
import React from "react"
import Slider from "react-slick"
import { BsArrowRightSquare } from "react-icons/bs"
import { BsArrowLeftSquare } from "react-icons/bs"

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

interface IMainPageProps {
    items: IArchiveItem[],
    title: string,
    btnTitle?: string,
    onMoreClicked?: () => void,
    className?: string,
}


function ArrowNext({ onClick = null}) {
    return (
        <div
            className={`
                flex flex-col justify-center items-center 
                h-full 
                w-10
                doom-btn
                right-0 absolute top-0
                transition-all
                duration-200
                `}
            onClick={onClick}
        >
            <BsArrowRightSquare className="w-10 h-12" />
        </div>
    )
}


function ArrowPrevious({ onClick = null}) {
    return (
        <div
            className={`
                flex flex-col justify-center items-center 
                h-full 
                w-10
                doom-btn
                left-0 absolute top-0 z-10
                `}
            onClick={onClick}
        >
            <BsArrowLeftSquare className="w-10 h-10" />
        </div>
    )
}


export function CategoryContainer({ 
    items, 
    title,
    btnTitle = "More",
    onMoreClicked = null,
    className="" 
}: IMainPageProps) {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 3,
        initialSlide: 0,
        lazyLoad: true,
        nextArrow: <ArrowNext 
        />,
        prevArrow: <ArrowPrevious />,
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
                    centerPadding: "14px",
                    centerMode: true,
                    arrows: false,
                }
            }
        ]
    }

    return (
        <div className={`min-w-full p-4 ${className}`}>
            <PreviewTitleWithBtn 
                title={title}
                label={btnTitle}
                onClick={onMoreClicked}
                className="px-14 sm:pl-12 text-lg"
            />

            <Slider {...settings} className="p-0 sm:pl-11 pl-2">
                {
                    items.map((item: IArchiveItem) => 
                        <ItemCardSimple 
                            key={`doom port item for ${item.title}`} item={item} 
                            className="justify-self-center flex-shrink-0
                            item flex flex-col text-slate-50 gap-1 py-2
                            w-72 h-[35rem]
                            "
                        />
                    )
                }
            </Slider>
        </div>
    )
} // MainPage


CategoryContainer.getLayout = getMainLayout
