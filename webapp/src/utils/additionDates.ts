import type { IArchiveItem } from "@/src/types"

export const JUST_ADDED_WINDOW = 10 * 24 * 60 * 60 * 1000

/** API boundary: explicit ISO instants only, never local dates or guessed dates. */
export function additionTime(value: unknown): number | null {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null
    if (Number(value.slice(11, 13)) > 23 || Number(value.slice(14, 16)) > 59 || Number(value.slice(17, 19)) > 59) return null
    const calendar = value.slice(0, 10)
    const time = Date.parse(value)
    const calendarTime = Date.parse(calendar)
    if (!Number.isFinite(time) || !Number.isFinite(calendarTime) || new Date(calendarTime).toISOString().slice(0, 10) !== calendar) return null
    return time
}

export function normalizeAddition(value: unknown): string | null {
    const time = additionTime(value)
    return time === null ? null : new Date(time).toISOString()
}

/** Prefer first-publication time; the accepted legacy approximation is createdAt.
 * Keep the original fields separate: this is display/ordering policy, not backfill. */
export function archiveAdditionDate(item: IArchiveItem): string | null {
    return normalizeAddition(item.addedAt) ?? normalizeAddition(item.createdAt)
}

export function isJustAdded(value: unknown, now: number): boolean {
    const time = additionTime(value)
    return time !== null && time <= now && now - time < JUST_ADDED_WINDOW
}

export function orderByAddition(items: IArchiveItem[]): IArchiveItem[] {
    return [...items].sort((a, b) => {
        const left = additionTime(archiveAdditionDate(a))
        const right = additionTime(archiveAdditionDate(b))
        if (left !== right) {
            if (left === null) return 1
            if (right === null) return -1
            return right - left
        }
        const leftId = String(a.id || "")
        const rightId = String(b.id || "")
        return leftId < rightId ? -1 : leftId > rightId ? 1 : 0
    })
}

export function recentAdditions(items: IArchiveItem[], now: number): IArchiveItem[] {
    return orderByAddition(items.filter(item => {
        const time = additionTime(archiveAdditionDate(item))
        return time !== null && time <= now
    })).slice(0, 10)
}

/** One page timer handles both future start boundaries and 10-day expirations. */
export function nextAdditionBoundary(items: IArchiveItem[], now: number): number | null {
    let next = Infinity
    for (const item of items) {
        const time = additionTime(archiveAdditionDate(item))
        if (time === null) continue
        if (time > now) next = Math.min(next, time)
        else if (time + JUST_ADDED_WINDOW > now) next = Math.min(next, time + JUST_ADDED_WINDOW)
    }
    return Number.isFinite(next) ? next : null
}
