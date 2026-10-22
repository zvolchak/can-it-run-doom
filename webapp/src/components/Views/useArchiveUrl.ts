import { useEffect, useRef } from "react"
import { useRouter } from "next/router"
import { useStore } from "react-redux"
import type { AppStore } from "@/src/store"
import { coordinateArchiveUrl } from "@/src/utils/archiveUrlCoordinator"

const useAppStore = useStore.withTypes<AppStore>()

/** One coordinator owns hydration and committed browsing writes. */
export function useArchiveUrl() {
    const router = useRouter()
    const store = useAppStore()
    const currentRouter = useRef(router)
    currentRouter.current = router
    useEffect(() => {
        if (!router.isReady) return
        return coordinateArchiveUrl(store, () => currentRouter.current, window)
        // Shallow transitions change router snapshots; callbacks read the current ref.
    }, [router.isReady, router.pathname, store])
}
