import { useRouter } from "next/router"
import { CiSquareRemove } from "react-icons/ci"

interface IBtnClearFiltersProps {
    target?: string
    className?: string
    children?: any
    onClick?: () => void
}


export function BtnClearFilters({ 
    target = "",
    onClick = null,
    className = "", 
    children 
}: IBtnClearFiltersProps) {
    const router = useRouter()

    function onBtnClick() {
        if (onClick) {
            onClick?.()
            return
        }

        let query = router.query
        if (target && target !== "")
            delete query[target]
        else
            query = {}

        router.push({
            pathname: router.pathname,
            query,
        })
    } // onBtnClick


    return (
        <button
            aria-label="Clear Filters" 
            className={`flex items-center btn-remove-filters  ${className}`}
            onClick={onBtnClick}
        >
            {children}
            <CiSquareRemove className="w-5 h-5 ml-2 text-slate-100 p-0 m-0"/>
        </button>
    )
}
