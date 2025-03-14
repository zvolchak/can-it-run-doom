import { useDispatch, useSelector, } from "react-redux"
import { 
    RootState,
} from "@/src/store"
import {
    IFiltersStoreState,
} from "@/src/types"
import { UnknownAction } from "@reduxjs/toolkit"


interface ITagProps {
    text: string
    queryKey: string
    className?: string
    onClick?: (e, tag: string) => void
    onDispatch?: (values: any) => UnknownAction
}


export const Tag = ({ 
    text, 
    queryKey,
    className = "",
    onClick = null,
    onDispatch = null,
}: ITagProps) => {
    const dispatch = useDispatch()
    const appliedFilters: IFiltersStoreState = useSelector((state: RootState) => state.appliedFilters)
 

    function onTagClick(e, text: string) {
        e.preventDefault()

        const values = [ ...appliedFilters[queryKey] ]
        const incomingTagIndex = values.indexOf(text)
        if (incomingTagIndex >= 0)
            values.splice(incomingTagIndex, 1)
        else
            values.push(text)

<<<<<<< HEAD
        dispatch(onDispatch?.(values))
=======
        dispatch(onDispatch(values))
>>>>>>> origin/main
        onClick?.(e, text)
    } // onTagClick

    return (
        <p
            key={`tag_${text}`}
            className={`py-1 px-2 tag bg-gray-700 h-7 ${className}`}
            onClick={(e) => onTagClick(e, text.replace("#", ""))}
        >
            {text}
        </p>
    )
}


export default Tag
