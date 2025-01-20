import { useState, useEffect } from "react"
import { BsArrowUpSquare } from "react-icons/bs"


interface IBtnScrollTopProps {
    className?: string
}


export function BtnScrollTop({ className = "", }: IBtnScrollTopProps) {
    const [isShowBackToTop, setIsShowBackToTop] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined")
            return

        window.addEventListener('scroll', () => {
            setIsShowBackToTop(window.scrollY > 1000)
        })
    }, [isShowBackToTop, setIsShowBackToTop])


    function onBtnClick() {
        if (typeof window === "undefined")
            return

        window.scrollTo({ top: 0, behavior: 'smooth' })
    }


    return (
        <div className={`${className}`}>
            <button className={`
                    ${isShowBackToTop ? "active" : ""}
                    back-to-top-btn
                `}
                onClick={onBtnClick}
                disabled={!isShowBackToTop}
            >
                <BsArrowUpSquare className="w-10 h-10"/>
            </button>
        </div>
    )
}
