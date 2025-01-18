import { useState, useCallback } from "react"
import { useRouter } from "next/router"
import { useSelector } from "react-redux"
import { RootState } from "@/src/store"
import debounce from "lodash/debounce"

interface ISearchbarProps {
    className?: string
}


export const Searchbar = ({ className = "" }) => {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const items = useSelector((state: RootState) => state.submissions.items)


    const debouncedSearch = useCallback(
        debounce((e) => {
            onSearchSubmit(e); // This will be called after debounce delay
        }, 2000), // 1000 ms (1 second) delay
        []
    )


    function onSearchUpdated(e) {
        setSearchQuery(e.target.value)
        setHasSubmitted(false)
        if (e.target.value === "")
            clearSearch()
        else
            onSearchSubmit(e)
    }


    function onSearchSubmit(e) {
        if (hasSubmitted)
            return

        setHasSubmitted(true)
        e.preventDefault()
        if (!searchQuery || searchQuery === "") {
            clearSearch()
        } else if (searchQuery.trim()) {
            router.push(`?search=${encodeURIComponent(searchQuery.trim())}`)
        }
    }


    function clearSearch() {
        const query = router.query
        delete query["search"]

        router.replace({
            pathname: router.pathname,
            query,
        })   
    }


    return (
        <div className={`flex justify-center items-center flex-1 ${className}`}>
            <form className="w-full max-w-lg z-20">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={onSearchUpdated}
                    placeholder="Search by title, author, #hashtag or date..."
                    className="w-full px-4 py-2 border-gray-300 rounded-none z-20
                    focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
            </form>
        </div>
    )
}


export default Searchbar
