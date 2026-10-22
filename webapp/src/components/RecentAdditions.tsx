import { useEffect, useRef, useState, type FocusEvent } from "react"
import type { IArchiveItem } from "@/src/types"
import { archiveAdditionDate, isJustAdded } from "@/src/utils/additionDates"
import { useProjectLink } from "./Containers/ProjectNavigation"
import { JustAddedBadge } from "./Item/JustAddedBadge"
import { ProjectPreview } from "./Item/ProjectPreview"
import { projectAuthors, projectDate, projectText } from "./Item/projectPresentation"

function RecentCard({ item, now }: { item: IArchiveItem, now: number }) {
    const link = useProjectLink()(item.id)
    const title = projectText(item.title) || "Untitled project"
    const authors = projectAuthors(item.authors)
    const year = projectDate(item.publishDate)
    const additionDate = archiveAdditionDate(item)
    const added = projectDate(additionDate)
    return (
        <article className="recent-card">
            <ProjectPreview src={item.previewImg} title={title} />
            <div className="recent-card__body">
                <div className="recent-card__addition">
                    {added && <time dateTime={additionDate}>Added {added.label}</time>}
                    {isJustAdded(additionDate, now) && <JustAddedBadge />}
                </div>
                <h3>{title}</h3>
                {authors.length > 0 && <p className="recent-card__authors">
                    {authors.slice(0, 2).map(author => author.name).join(", ")}
                    {authors.length > 2 && ` +${authors.length - 2} more`}
                </p>}
                {year && <p className="recent-card__year">Project year: <time dateTime={year.dateTime}>{year.year}</time></p>}
                <a className="recent-card__action" href={link.href} onClick={link.onClick} aria-label={`View project: ${title}`}>
                    View project <span aria-hidden="true">→</span>
                </a>
            </div>
        </article>
    )
}

/** Selection belongs to the page; this list owns only its native scroll area. */
export function RecentAdditions({ items, now }: { items: IArchiveItem[], now: number }) {
    const list = useRef<HTMLUListElement>(null)
    const [boundary, setBoundary] = useState({ start: true, end: false, fits: items.length <= 1 })
    useEffect(() => {
        const area = list.current
        if (!area) return
        const measure = () => setBoundary({
            start: area.scrollLeft <= 1,
            end: area.scrollLeft + area.clientWidth >= area.scrollWidth - 1,
            fits: area.scrollWidth <= area.clientWidth + 1,
        })
        const observer = new ResizeObserver(measure)
        observer.observe(area)
        for (const card of area.children) observer.observe(card)
        area.addEventListener("scroll", measure, { passive: true })
        area.addEventListener("load", measure, true)
        window.addEventListener("resize", measure)
        measure()
        return () => {
            observer.disconnect()
            area.removeEventListener("scroll", measure)
            area.removeEventListener("load", measure, true)
            window.removeEventListener("resize", measure)
        }
    }, [items])

    function scrollToCard(left: number) {
        const area = list.current
        if (!area) return
        area.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
    }
    function advance(direction: number) {
        const area = list.current
        if (!area) return
        const origin = area.getBoundingClientRect().left + parseFloat(getComputedStyle(area).paddingLeft)
        const positions = Array.from(area.children).map(card => card.getBoundingClientRect().left - origin + area.scrollLeft)
        const destination = direction > 0
            ? positions.find(left => left > area.scrollLeft + 2) ?? area.scrollWidth - area.clientWidth
            : positions.reverse().find(left => left < area.scrollLeft - 2) ?? 0
        scrollToCard(destination)
    }
    function revealFocusedCard(event: FocusEvent<HTMLUListElement>) {
        const area = list.current
        const card = (event.target as HTMLElement).closest("li")
        if (!area || !card) return
        const viewport = area.getBoundingClientRect()
        const bounds = card.getBoundingClientRect()
        if (bounds.left < viewport.left) scrollToCard(area.scrollLeft + bounds.left - viewport.left)
        else if (bounds.right > viewport.right) scrollToCard(area.scrollLeft + bounds.right - viewport.right)
    }

    if (!items.length) return null
    return (
        <section className="recent-additions" aria-labelledby="recent-additions-heading">
            <header className="recent-additions__header">
                <h2 id="recent-additions-heading">Recently added to the archive</h2>
            </header>
            <ul id="recent-additions-list" ref={list} className="recent-additions__list" onFocusCapture={revealFocusedCard} aria-label="Recent archive additions">
                {items.map(item => <li key={item.id}><RecentCard item={item} now={now} /></li>)}
            </ul>
            <div className="recent-additions__navigation" hidden={boundary.fits}>
                <button type="button" aria-label="Previous recent addition" aria-controls="recent-additions-list" disabled={boundary.start} onClick={() => advance(-1)}>← Previous</button>
                <button type="button" aria-label="Next recent addition" aria-controls="recent-additions-list" disabled={boundary.end} onClick={() => advance(1)}>Next →</button>
            </div>
        </section>
    )
}
