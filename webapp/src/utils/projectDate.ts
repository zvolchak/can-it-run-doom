export function projectDate(value: unknown): { label: string, year: string, dateTime: string } | null {
    const text = typeof value === "string" ? value.trim() : ""
    if (!text) return null

    // Historical records use "Aug 8, 2014"; interpret calendar dates in UTC so
    // the server and browser agree regardless of their local time zones.
    const calendarMatch = /^([a-z]+)\s+(\d{1,2}),\s*(\d{4})$/i.exec(text)
    const isoMatch = /^(\d{4}-\d{2}-\d{2})(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.exec(text)
    let calendar: string
    let timestamp: string

    if (calendarMatch) {
        const months = ["january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december"]
        const monthName = calendarMatch[1].toLowerCase()
        const month = months.findIndex(name => name === monthName || name.slice(0, 3) === monthName)
        if (month < 0) return null
        calendar = `${calendarMatch[3]}-${String(month + 1).padStart(2, "0")}-${calendarMatch[2].padStart(2, "0")}`
        timestamp = calendar
    } else if (isoMatch) {
        calendar = isoMatch[1]
        timestamp = text.includes("T") && !/(Z|[+-]\d{2}:\d{2})$/.test(text) ? `${text}Z` : text
    } else {
        return null
    }

    // Date parsing can silently roll February 31 into March; reject that too.
    const calendarDate = new Date(calendar)
    if (Number.isNaN(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== calendar) return null

    const clock = /T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(timestamp)
    if (clock && (Number(clock[1]) > 23 || Number(clock[2]) > 59 || Number(clock[3] || 0) > 59)) return null

    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return null

    const dateTime = date.toISOString().slice(0, 10)

    return {
        label: new Intl.DateTimeFormat("en-US", {
            month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
        }).format(date),
        year: String(date.getUTCFullYear()),
        dateTime,
    }
}
