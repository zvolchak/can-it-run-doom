import { useEffect, useState } from "react"
import { FaSearch } from "react-icons/fa"
import { useDispatch, useSelector, } from "react-redux"
import { 
    RootState,
    setAppliedSearch,
} from "@/src/store"

interface ISearchbarProps {
    className?: string
}


export const Searchbar = ({ className = "" }: ISearchbarProps) => {
    const dispatch = useDispatch()
    const appliedSearch = useSelector((state: RootState) => state.appliedFilters.searchString)

    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        setSearchQuery(appliedSearch || "")
    }, [appliedSearch])

    function onSearchUpdated(e) {
        const nextValue = e.target.value
        setSearchQuery(nextValue)

        if (!nextValue.trim()) {
            dispatch(setAppliedSearch(null))
            return
        }

        dispatch(setAppliedSearch(nextValue.trim()))
    }


    function onSearchSubmit(e) {
        e.preventDefault()
        if (!searchQuery.trim()) {
            dispatch(setAppliedSearch(null))
            return
        }

        dispatch(setAppliedSearch(searchQuery.trim()))
    }


    return (
        <div className={`flex justify-center items-center ${className}`}>
            <form className="input-with-button flex flex-flow w-full z-20" 
                onSubmit={onSearchSubmit}
            >
                <input
                    type="text"
                    value={searchQuery}
                    onChange={onSearchUpdated}
                    onBlur={onSearchSubmit}
                    placeholder="Search by title, author, #hashtag or date..."
                    className="w-full px-4 py-2 border-gray-300 rounded-none z-20
                    focus:outline-none focus:ring-2 focus:ring-gray-500"
                />

                <button
                    onClick={onSearchSubmit}
                    className="px-3 py-1 doom-bg-dark text-white 
                        h-full border-l-2xl
                        hover:bg-gray-600 focus:outline-none"
                >
                    <FaSearch />
                </button>
            </form>
        </div>
    )
}


export default Searchbar
