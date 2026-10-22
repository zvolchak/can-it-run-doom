import { useEffect, useRef, type MouseEvent, type PointerEvent, type ReactNode } from "react"
import { FiX } from "react-icons/fi"

interface ProjectDialogProps {
    headingId: string
    onClose: () => void
    children: ReactNode
    footer?: ReactNode
    className?: string
}

/** Mounted only while a project is selected. The native modal supplies inertness
 * and keyboard focus containment without changing the moderation modal. */
export function ProjectDialog({
    headingId, onClose, children, footer, className = "",
}: ProjectDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const closeRef = useRef<HTMLButtonElement>(null)
    const backdropPress = useRef(false)

    useEffect(() => {
        const dialog = dialogRef.current
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
        const body = document.body
        const originalOverflow = body.style.overflow
        const originalPadding = body.style.paddingRight
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

        dialog.showModal()
        closeRef.current?.focus({ preventScroll: true })
        body.style.overflow = "hidden"
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${parseFloat(window.getComputedStyle(body).paddingRight) + scrollbarWidth}px`
        }

        return () => {
            dialog.close()
            body.style.overflow = originalOverflow
            body.style.paddingRight = originalPadding
            if (opener?.isConnected) opener.focus({ preventScroll: true })
        }
    }, [])

    function isBackdrop(event: MouseEvent<HTMLDialogElement> | PointerEvent<HTMLDialogElement>) {
        if (event.target !== event.currentTarget) return false
        const rect = event.currentTarget.getBoundingClientRect()
        return event.clientX < rect.left || event.clientX > rect.right
            || event.clientY < rect.top || event.clientY > rect.bottom
    }

    return (
        <dialog ref={dialogRef} className={`project-dialog ${className}`} aria-labelledby={headingId}
            onKeyDown={event => {
                if (event.key !== "Tab") return
                const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
                    "button:not(:disabled), a[href]",
                )).filter(element => element.getClientRects().length > 0)
                const first = controls[0]
                const last = controls[controls.length - 1]
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault()
                    last?.focus({ preventScroll: true })
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault()
                    first?.focus({ preventScroll: true })
                }
            }}
            onCancel={event => {
                event.preventDefault()
                onClose()
            }}
            onPointerDown={event => { backdropPress.current = isBackdrop(event) }}
            onClick={event => {
                const dismiss = backdropPress.current && isBackdrop(event)
                backdropPress.current = false
                if (dismiss) onClose()
            }}>
            <header className="project-dialog__header">
                <span className="project-dialog__label"><span>Can It Run Doom? / </span>Archive</span>
                <button ref={closeRef} type="button" className="project-dialog__close"
                    onClick={onClose} aria-label="Close project and return to archive">
                    <span className="project-dialog__desktop-close">Close</span>
                    <span className="project-dialog__mobile-close">Back to archive</span>
                    <FiX aria-hidden="true" />
                </button>
            </header>
            <div className="project-dialog__content">
                {children}
                {footer && <footer className="project-dialog__footer">{footer}</footer>}
            </div>
        </dialog>
    )
}
