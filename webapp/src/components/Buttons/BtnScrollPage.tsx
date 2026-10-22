import { useState, useEffect } from "react"
import { BsArrowUpSquare, BsArrowDownSquare } from "react-icons/bs"


interface IBtnScrollPageProps {
    className?: string
    direction?: "top" | "bottom"
}


export function BtnScrollPage({ className = "", direction = "top", }: IBtnScrollPageProps) {
    const [isVisibleForDirection, setIsVisibleForDirection] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return

        const TOP_THRESHOLD = 1500
        const EDGE_THRESHOLD = 24
        const updateVisibility = () => {
            const scrollY = window.scrollY
            const innerH = window.innerHeight
            const scrollH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
            const maxScrollY = Math.max(scrollH - innerH, 0)

            if (direction === "top") {
                setIsVisibleForDirection(scrollY > TOP_THRESHOLD)
            } else {
                // Show whenever the page can still scroll down.
                setIsVisibleForDirection(maxScrollY > EDGE_THRESHOLD && scrollY < (maxScrollY - EDGE_THRESHOLD))
            }
        }

        const resizeObserver = new ResizeObserver(() => updateVisibility())

        window.addEventListener("scroll", updateVisibility)
        window.addEventListener("resize", updateVisibility)
        window.addEventListener("load", updateVisibility)
        resizeObserver.observe(document.body)
        resizeObserver.observe(document.documentElement)

        updateVisibility()

        return () => {
            window.removeEventListener("scroll", updateVisibility)
            window.removeEventListener("resize", updateVisibility)
            window.removeEventListener("load", updateVisibility)
            resizeObserver.disconnect()
        }
    }, [direction])


    function onBtnClick(dir?: "top" | "bottom") {
        const target = dir || direction || "bottom"
        if (typeof window === "undefined") return

        if (target === "bottom") {
            const scrollTarget = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
            window.scrollTo({ top: scrollTarget, behavior: "smooth" })
        } else {
            // smooth scroll to top then ensure exact zero offset
            window.scrollTo({ top: 0, behavior: "smooth" })
            // after animation, force exact position to avoid leftover margin
            setTimeout(() => {
                try { window.scrollTo({ top: 0, behavior: "auto" }) } catch (e) {}
            }, 300)
        }
    }


    return (
        <div className={`${className}`}>
            <button
                aria-label={`Scroll to ${direction}`}
                className={`
                    ${isVisibleForDirection ? "active" : ""}
                    back-to-top-btn
                `}
                onClick={() => onBtnClick()}
                disabled={!isVisibleForDirection}
                type="button"
            >
                {direction === "bottom" ? (
                    <BsArrowDownSquare className="w-10 h-10" />
                ) : (
                    <BsArrowUpSquare className="w-10 h-10" />
                )}
            </button>
        </div>
    )
}

export default BtnScrollPage
