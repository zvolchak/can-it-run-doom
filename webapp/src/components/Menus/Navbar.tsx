import Image from "next/image"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/router"
import Link from "next/link"
import {
    Searchbar,
} from "@/src/components"
import {
    setAppliedAuthors,
    setAppliedId,
    setAppliedPage,
    setAppliedSearch,
    setAppliedTags,
    setAppliedYears,
    setIsFiltersMenu,
    setQuery,
} from "@/src/store"


export const Navbar = () => {
    const dispatch = useDispatch()
    const router = useRouter()

    useEffect(() => {
        if (router.pathname === "/" || router.pathname === "/entries") return
        dispatch(setAppliedTags([]))
        dispatch(setAppliedAuthors([]))
        dispatch(setAppliedYears(null))
        dispatch(setAppliedSearch(null))
        dispatch(setAppliedId([]))
        dispatch(setAppliedPage(1))
        dispatch(setQuery({}))
        dispatch(setIsFiltersMenu(false))
    }, [dispatch, router.pathname])


    function shouldShowHomeButton() {
        const hasQuery = Object.keys(router.query || {}).length > 0
        const isRootPreviewPage = router.pathname === "/" && hasQuery
        const isEntriesPreviewPage = router.pathname === "/entries" && !!router.query.id

        return isRootPreviewPage || isEntriesPreviewPage
    }

    function shouldShowSearchbar() {
        const isAddEntryPage = router.pathname === "/entries/add"
        const isEntryPreviewPage = router.pathname === "/" && !!router.query.id

        return !isAddEntryPage && !isEntryPreviewPage
    }


    const showHome = shouldShowHomeButton()
    const showSearch = shouldShowSearchbar()

    return (
        <nav aria-label="Main navigation" className={`site-navbar${showHome ? " site-navbar--with-home" : ""}${showSearch ? " site-navbar--with-search" : ""}`}>
            <Link className="site-navbar__brand" href="/">
                <Image src="/favicon.ico" alt="can it run doom?" width={40} height={40} />
            </Link>
            {showHome && (
                <button type="button" className="site-navbar__home doom-btn" onClick={() => router.push("/")}>
                    Home
                </button>
            )}
            {showSearch && <Searchbar className="site-navbar__search" />}
            <Link className="site-navbar__add doom-btn" href="/entries/add">Add Entry</Link>
        </nav>
    )
}
