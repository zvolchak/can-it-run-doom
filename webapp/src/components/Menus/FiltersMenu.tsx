import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { IArchiveItem, IFiltersStoreState } from "@/src/types"
import { type RootState, applyArchiveFilters, setIsFiltersMenu } from "@/src/store"
import { archiveResults } from "@/src/utils/archiveResults"
import { ArchiveFilterControls } from "./ArchiveFilterControls"

export function FiltersMenu({ items }: { items: IArchiveItem[] }) {
    const dispatch = useDispatch()
    const applied = useSelector((state: RootState) => state.appliedFilters)
    const open = useSelector((state: RootState) => state.settings.isFiltersMenu)
    const [draft, setDraft] = useState<IFiltersStoreState>(applied)
    const [desktop, setDesktop] = useState(false)
    const dialog = useRef<HTMLDialogElement>(null)
    const close = () => dispatch(setIsFiltersMenu(false))
    useEffect(() => {
        const media = window.matchMedia("(min-width: 1024px)")
        const update = () => { setDesktop(media.matches); dispatch(setIsFiltersMenu(false)) }
        update()
        media.addEventListener("change", update)
        return () => media.removeEventListener("change", update)
    }, [dispatch])
    useEffect(() => {
        if (!open) return
        if (desktop) {
            document.getElementById("archive-tags-heading")?.focus({ preventScroll: true })
            dispatch(setIsFiltersMenu(false))
            return
        }
        setDraft(applied)
        const opener = document.activeElement as HTMLElement
        const overflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        const element = dialog.current
        element?.showModal()
        return () => {
            element?.close()
            document.body.style.overflow = overflow
            if (opener?.isConnected) opener.focus({ preventScroll: true })
        }
        // Applied state is captured only when opening, never published while drafting.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, desktop, dispatch])
    return <>
        {desktop && <aside id="archive-filters" className="archive-tag-rail" aria-label="Archive filters">
            <ArchiveFilterControls items={items} value={applied} onChange={value => dispatch(applyArchiveFilters(value))} />
        </aside>}
        {!desktop && <dialog aria-labelledby="archive-filter-title" id="archive-filters" className="archive-filter-dialog" ref={dialog} onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === event.currentTarget) close() }}>
            <div className="archive-filter-dialog__shell">
                <header><h2 id="archive-filter-title">Archive filters</h2><button type="button" onClick={close} aria-label="Close filters">Close</button></header>
                <div className="archive-filter-dialog__content"><ArchiveFilterControls items={items} value={draft} onChange={setDraft} /></div>
                <footer><button type="button" onClick={close}>Cancel</button><button type="button" onClick={() => { dispatch(applyArchiveFilters(draft)); close() }}>Show {archiveResults(items, draft).total} projects</button></footer>
            </div>
        </dialog>}
    </>
}
