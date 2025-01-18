import { useState } from "react"
import { useRouter } from "next/router"


interface ISearchbarProps {
    className?: string
}


export const Searchbar = ({ className = "" }) => {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")

    function onSearchSubmit(e) {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`?search=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    return (
        <div className={`flex justify-center items-center flex-1 ${className}`}>
            <form className="w-full max-w-lg z-20" onSubmit={onSearchSubmit}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, author, #hashtag or date..."
                    className="w-full px-4 py-2 border-gray-300 rounded-none z-20
                    focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
            </form>
        </div>
    )
}


export default Searchbar
