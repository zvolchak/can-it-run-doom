import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { FiCheck, FiShare2 } from "react-icons/fi"
import { FaBluesky, FaEllipsis, FaFacebook, FaLink, FaLinkedin, FaReddit, FaXTwitter } from "react-icons/fa6"
import type { IArchiveItem } from "@/src/types"
import { projectShareUrl, shareProject, shareTargets, type ShareResult, type ShareTarget } from "@/src/utils/shareProject"

interface ShareButtonProps {
    item: IArchiveItem
    className?: string
    /** Text-link styling, to sit beside the "View project" link on cards. */
    compact?: boolean
}

const STATUS_MS = 2500
const MENU_GAP = 4
const VIEWPORT_MARGIN = 8
const ICONS: Record<ShareTarget["id"], typeof FaLink> = {
    x: FaXTwitter, facebook: FaFacebook, reddit: FaReddit, bluesky: FaBluesky, linkedin: FaLinkedin,
}

export function ShareButton({ item, className = "", compact = false }: ShareButtonProps) {
    const [open, setOpen] = useState(false)
    const [status, setStatus] = useState("")
    const [canNativeShare, setCanNativeShare] = useState(false)
    const [position, setPosition] = useState<{ top: number, left: number, maxHeight: number } | null>(null)
    const root = useRef<HTMLSpanElement>(null)
    const trigger = useRef<HTMLButtonElement>(null)
    const menu = useRef<HTMLUListElement>(null)
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
    const menuId = useId()
    const title = item.title || "Doom port"

    useEffect(() => setCanNativeShare(typeof navigator.share === "function"), [])
    useEffect(() => () => clearTimeout(timer.current), [])
    // The menu is portaled out of the card so neighbouring cards and clipped
    // modal content cannot paint over it. Inside a modal <dialog> it must stay
    // within the dialog, because the dialog sits in the browser's top layer.
    const host = () => root.current?.closest("dialog") ?? document.body

    useLayoutEffect(() => {
        if (!open) return setPosition(null)
        const place = () => {
            const anchor = trigger.current?.getBoundingClientRect()
            if (!anchor) return
            const width = menu.current?.offsetWidth ?? 0
            const top = anchor.bottom + MENU_GAP
            setPosition({
                top,
                left: Math.max(VIEWPORT_MARGIN, Math.min(anchor.left, window.innerWidth - width - VIEWPORT_MARGIN)),
                maxHeight: Math.max(0, window.innerHeight - top - VIEWPORT_MARGIN),
            })
        }
        // Always drop down: scroll the trigger up first when the menu would not fit below it.
        const anchor = trigger.current?.getBoundingClientRect()
        const height = menu.current?.offsetHeight ?? 0
        if (anchor && anchor.bottom + MENU_GAP + height > window.innerHeight - VIEWPORT_MARGIN) {
            trigger.current?.scrollIntoView({ block: "start", behavior: "instant" })
        }
        place()
        window.addEventListener("resize", place)
        window.addEventListener("scroll", place, true)
        return () => {
            window.removeEventListener("resize", place)
            window.removeEventListener("scroll", place, true)
        }
    }, [open])

    useEffect(() => {
        if (!open) return
        const onPointer = (event: PointerEvent) => {
            const target = event.target as Node
            if (!root.current?.contains(target) && !menu.current?.contains(target)) setOpen(false)
        }
        const onKey = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return
            setOpen(false)
            trigger.current?.focus()
        }
        document.addEventListener("pointerdown", onPointer)
        document.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("pointerdown", onPointer)
            document.removeEventListener("keydown", onKey)
        }
    }, [open])

    const url = () => projectShareUrl(window.location.origin, item.id)

    function announce(message: string) {
        clearTimeout(timer.current)
        setStatus(message)
        timer.current = setTimeout(() => setStatus(""), STATUS_MS)
    }

    async function copy() {
        const result = await shareProject({ clipboard: navigator.clipboard }, title, url())
        announce(result === "copied" ? "Link copied" : "Couldn't copy link")
        setOpen(false)
    }

    async function nativeShare() {
        setOpen(false)
        const result: ShareResult = await shareProject({ share: navigator.share?.bind(navigator), clipboard: navigator.clipboard }, title, url())
        if (result === "copied") announce("Link copied")
        if (result === "failed") announce("Couldn't share link")
    }

    const targets = open ? shareTargets(title, url()) : []
    return (
        <span ref={root} className={`share-button ${className}`}>
            <button ref={trigger} type="button" style={{ scrollMarginTop: "5rem" }} className={compact ? "share-button__link" : "project-preview-trigger"} aria-haspopup="menu"
                aria-expanded={open} aria-controls={open ? menuId : undefined}
                aria-label={`Share project: ${title}`} onClick={() => setOpen(value => !value)}>
                {status.startsWith("Link copied") ? <FiCheck aria-hidden="true" /> : <FiShare2 aria-hidden="true" />}
                Share
            </button>
            {open && createPortal(
                <ul ref={menu} id={menuId} className="share-button__menu" aria-label={`Share ${title}`}
                    style={{ top: position?.top ?? 0, left: position?.left ?? 0, maxHeight: position?.maxHeight, visibility: position ? "visible" : "hidden" }}>
                    {targets.map(target => {
                        const Icon = ICONS[target.id]
                        return (
                            <li key={target.id}>
                                <a href={target.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                                    <Icon aria-hidden="true" />{target.label}
                                    <span className="sr-only"> (opens in a new tab)</span>
                                </a>
                            </li>
                        )
                    })}
                    <li><button type="button" onClick={copy}><FaLink aria-hidden="true" />Copy link</button></li>
                    {canNativeShare && <li><button type="button" onClick={nativeShare}><FaEllipsis aria-hidden="true" />More…</button></li>}
                </ul>,
                host(),
            )}
            <span className="share-button__status" role="status" aria-live="polite">{status}</span>
        </span>
    )
}
