import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { KeyboardEvent } from "react"


export interface IDropdownOption {
    value: string
    label: string
    /** Options sharing a group are shown under one heading; keep them adjacent in `options`. */
    group?: string
    description?: string
}


interface ISearchableDropdownProps {
    options: IDropdownOption[]
    value: string[]
    onChange: (value: string[]) => void
    label?: string
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    /** Single mode replaces the selection and closes the list after a pick. */
    multiple?: boolean
    className?: string
}


const MENU_GAP = 4
const VIEWPORT_MARGIN = 8
const MIN_ROOM = 280

const matches = (option: IDropdownOption, query: string) => {
    const needle = query.trim().toLowerCase()
    return !needle || option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle)
}


export function SearchableDropdown({
    options,
    value,
    onChange,
    label = "",
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    emptyMessage = "No matches.",
    multiple = true,
    className = "",
}: ISearchableDropdownProps) {
    const id = useId()
    const root = useRef<HTMLDivElement>(null)
    const search = useRef<HTMLInputElement>(null)
    const trigger = useRef<HTMLButtonElement>(null)
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [active, setActive] = useState(0)
    const [position, setPosition] = useState<{ top: number, left: number, width: number, maxHeight: number } | null>(null)
    const panel = useRef<HTMLDivElement>(null)

    const byValue = useMemo(() => new Map(options.map(option => [option.value, option])), [options])
    const visible = useMemo(() => options.filter(option => matches(option, query)), [options, query])
    const activeIndex = Math.min(active, Math.max(visible.length - 1, 0))
    const optionId = (index: number) => `${id}-option-${index}`

    // The panel is fixed and portaled so it overlaps the page without clipping
    // or lengthening it. Inside a modal <dialog> it stays in the dialog, which
    // sits in the browser's top layer.
    const host = () => root.current?.closest("dialog") ?? document.body

    useLayoutEffect(() => {
        if (!open) return setPosition(null)
        const place = () => {
            const anchor = trigger.current?.getBoundingClientRect()
            if (!anchor) return
            const top = anchor.bottom + MENU_GAP
            setPosition({
                top,
                left: anchor.left,
                width: anchor.width,
                maxHeight: Math.max(0, window.innerHeight - top - VIEWPORT_MARGIN),
            })
        }
        const anchor = trigger.current?.getBoundingClientRect()
        if (anchor && window.innerHeight - anchor.bottom < MIN_ROOM) {
            trigger.current?.scrollIntoView({ block: "center", behavior: "instant" })
        }
        place()
        window.addEventListener("resize", place)
        window.addEventListener("scroll", place, true)
        return () => {
            window.removeEventListener("resize", place)
            window.removeEventListener("scroll", place, true)
        }
    }, [open])

    const placed = position !== null
    useEffect(() => {
        if (!open || !placed) return
        search.current?.focus({ preventScroll: true })
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node
            if (!root.current?.contains(target) && !panel.current?.contains(target)) close(false)
        }
        document.addEventListener("pointerdown", onPointerDown)
        return () => document.removeEventListener("pointerdown", onPointerDown)
    }, [open, placed])

    useEffect(() => {
        if (open) document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: "nearest" })
    }, [open, activeIndex])

    function close(returnFocus = true) {
        setOpen(false)
        setQuery("")
        setActive(0)
        if (returnFocus) trigger.current?.focus()
    }

    function toggle(option: IDropdownOption) {
        if (!multiple) {
            onChange([option.value])
            close()
            return
        }
        onChange(value.includes(option.value) ? value.filter(item => item !== option.value) : [...value, option.value])
    }

    function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown") {
            event.preventDefault()
            setActive(Math.min(activeIndex + 1, visible.length - 1))
        } else if (event.key === "ArrowUp") {
            event.preventDefault()
            setActive(Math.max(activeIndex - 1, 0))
        } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault()
            setActive(event.key === "Home" ? 0 : visible.length - 1)
        } else if (event.key === "Enter") {
            event.preventDefault()
            if (visible[activeIndex]) toggle(visible[activeIndex])
        } else if (event.key === "Escape") {
            event.preventDefault()
            event.stopPropagation()
            close()
        } else if (event.key === "Tab") {
            close(false)
        }
    }

    const summary = value.length === 0
        ? placeholder
        : multiple ? `${value.length} selected` : byValue.get(value[0])?.label ?? value[0]

    return (
        <div className={`dropdown ${className}`} ref={root}>
            {label && <span className="dropdown__label" id={`${id}-label`}>{label}</span>}
            <button
                type="button"
                ref={trigger}
                className="dropdown__trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-labelledby={label ? `${id}-label ${id}-trigger` : undefined}
                id={`${id}-trigger`}
                onClick={() => (open ? close() : setOpen(true))}
            >
                <span className={value.length === 0 ? "dropdown__placeholder" : ""}>{summary}</span>
                <span aria-hidden="true" className="dropdown__caret">▾</span>
            </button>

            {open && createPortal(
                <div ref={panel} className="dropdown__panel"
                    style={{ top: position?.top ?? 0, left: position?.left ?? 0, width: position?.width, maxHeight: position?.maxHeight, visibility: position ? "visible" : "hidden" }}>
                    <input
                        ref={search}
                        type="search"
                        role="combobox"
                        aria-expanded="true"
                        aria-controls={`${id}-list`}
                        aria-activedescendant={visible.length ? optionId(activeIndex) : undefined}
                        aria-label={searchPlaceholder}
                        autoComplete="off"
                        className="dropdown__search"
                        placeholder={searchPlaceholder}
                        value={query}
                        onChange={event => { setQuery(event.target.value); setActive(0) }}
                        onKeyDown={onSearchKeyDown}
                    />
                    <ul role="listbox" id={`${id}-list`} aria-multiselectable={multiple} aria-labelledby={label ? `${id}-label` : undefined} className="dropdown__list">
                        {visible.map((option, index) => {
                            const selected = value.includes(option.value)
                            const heading = option.group && option.group !== visible[index - 1]?.group
                            return (
                                <li key={option.value} role="presentation">
                                    {heading && <div className="dropdown__group" role="presentation">{option.group}</div>}
                                    <div
                                        role="option"
                                        id={optionId(index)}
                                        aria-selected={selected}
                                        className={`dropdown__option${index === activeIndex ? " is-active" : ""}`}
                                        onPointerEnter={() => setActive(index)}
                                        onPointerDown={event => event.preventDefault()}
                                        onClick={() => toggle(option)}
                                    >
                                        <span className="dropdown__check" aria-hidden="true">{selected ? "✓" : ""}</span>
                                        <span>
                                            {option.label}
                                            {option.description && <small className="dropdown__description">{option.description}</small>}
                                        </span>
                                    </div>
                                </li>
                            )
                        })}
                        {visible.length === 0 && <li role="presentation" className="dropdown__empty">{emptyMessage}</li>}
                    </ul>
                </div>,
                host(),
            )}

            {multiple && value.length > 0 && (
                <ul className="dropdown__chips" aria-label={label ? `Selected: ${label}` : "Selected"}>
                    {value.map(item => (
                        <li key={item}>
                            <button type="button" className="dropdown__chip" onClick={() => onChange(value.filter(other => other !== item))} aria-label={`Remove ${byValue.get(item)?.label ?? item}`}>
                                {byValue.get(item)?.label ?? item} <span aria-hidden="true">×</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
