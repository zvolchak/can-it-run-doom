import { useEffect, useState } from "react"
import type { IArchiveItem } from "@/src/types"
import { nextAdditionBoundary } from "@/src/utils/additionDates"

export function useAdditionClock(items: IArchiveItem[], referenceTime: number) {
    const [now, setNow] = useState(referenceTime)
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>
        function refresh() {
            clearTimeout(timer)
            const current = Date.now()
            setNow(current)
            const next = nextAdditionBoundary(items, current)
            if (next !== null) timer = setTimeout(refresh, Math.min(next - current, 2_147_483_647))
        }
        function onVisibility() {
            if (document.visibilityState === "visible") refresh()
        }
        refresh()
        document.addEventListener("visibilitychange", onVisibility)
        return () => {
            clearTimeout(timer)
            document.removeEventListener("visibilitychange", onVisibility)
        }
    }, [items, referenceTime])
    return now
}
