import { useEffect, useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/router"
import { FaSearch, FaTimes } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { type RootState, setAppliedSearch } from "@/src/store"
import { normalizeSearch } from "@/src/utils/archiveSearch"
import { archiveHref } from "@/src/utils/projectNavigation"

interface ISearchbarProps {
    className?: string
}

export const Searchbar = ({ className = "" }: ISearchbarProps) => {
    const router = useRouter()
    const dispatch = useDispatch()
    const appliedSearch = useSelector((state: RootState) => state.appliedFilters.searchString) || ""
    const [draft, setDraft] = useState(appliedSearch)
    const input = useRef<HTMLInputElement>(null)
    const composing = useRef(false)

    useEffect(() => { setDraft(appliedSearch) }, [appliedSearch])

    function submit(event: FormEvent) {
        event.preventDefault()
        if (composing.current) return
        const search = normalizeSearch(draft)
        setDraft(search)
        dispatch(setAppliedSearch(search))
        if (router.pathname !== "/" && router.pathname !== "/entries") {
            void router.push(archiveHref("/entries", { page: "1", ...(search ? { search } : {}) }))
        }
    }

    function clear() {
        setDraft("")
        dispatch(setAppliedSearch(""))
        input.current?.focus()
    }

    return (
        <div className={`archive-search ${className}`}>
            <form className="archive-search__form" role="search" aria-label="Archive" onSubmit={submit}>
                <input
                    ref={input}
                    type="text"
                    aria-label="Search archive"
                    value={draft}
                    onChange={event => setDraft(event.target.value)}
                    onCompositionStart={() => { composing.current = true }}
                    onCompositionEnd={() => { composing.current = false }}
                    placeholder="Search titles, authors, #tags or dates..."
                />
                {(draft || appliedSearch) && (
                    <button type="button" aria-label="Clear search" onClick={clear}>
                        <FaTimes aria-hidden="true" />
                    </button>
                )}
                <button type="submit" aria-label="Submit archive search">
                    <FaSearch aria-hidden="true" />
                </button>
            </form>
        </div>
    )
}

export default Searchbar
