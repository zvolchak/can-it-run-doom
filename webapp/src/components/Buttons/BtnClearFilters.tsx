import { useRouter } from "next/router"
import { CiSquareRemove } from "react-icons/ci"

interface IBtnClearFiltersProps {
    className?: string
}


export function BtnClearFilters({ className = "",}: IBtnClearFiltersProps) {
    const router = useRouter()

    function onBtnClick() {
        router.push({
            pathname: router.pathname,
            query: {},
        })   
    }


    return (
        <div className={`${className}`}>
            <button
                aria-label="Clear Filters" 
                className={`flex items-center btn-remove-filters`}
                onClick={onBtnClick}
            >
                Clear Filters
                <CiSquareRemove className="w-8 h-6 text-slate-100"/>
            </button>
        </div>
    )
}
