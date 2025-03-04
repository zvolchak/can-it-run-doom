import { CiSquareRemove } from "react-icons/ci"

interface IBtnClearFiltersProps {
    className?: string
    children?: any
    onClick?: (e: any) => void
}


export function BtnClearFilters({ 
    onClick = null,
    className = "", 
    children 
}: IBtnClearFiltersProps) {
    function onBtnClick(e) {
        if (onClick) {
            onClick?.(e)
            return
        }
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
