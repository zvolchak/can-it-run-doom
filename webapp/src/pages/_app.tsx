import "@/src/styles/globals.scss"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { Provider, useDispatch, useSelector, } from "react-redux"
import { v4 as uuidv4 } from 'uuid'
import { 
    RootState,
    store,
    setUserSessionId,
} from "@/src/store"
import { analyticsApp, trackPageView } from "@/src/utils/analytics"


function UserSessionInit() {
    const dispatch = useDispatch()
    const [isSessionCreated, setIsSessionCreated] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined" || isSessionCreated)
            return

        dispatch(setUserSessionId(uuidv4()))
        setIsSessionCreated(true)
    }, [dispatch, isSessionCreated, setIsSessionCreated])

    return null
} // UserSessionInit


function PageViewAnalytics() {
    const router = useRouter()
    const userSessionId: string = useSelector((state: RootState) => state.user?.data?.sessionId) || ""

    useEffect(() => {
        const handleRouteChange = (url) => {
            trackPageView(analyticsApp, url, userSessionId)
        }

        router.events.on("routeChangeComplete", handleRouteChange)

        return () => {
            router.events.off("routeChangeComplete", handleRouteChange)
        }
    }, [router, userSessionId])

    return <div></div>
} // PageViewAnalytics


function App({ Component, pageProps }) {
    const getLayout = Component.getLayout || ((page) => page)

    return (
        <Provider store={store}>
            <UserSessionInit />
            <PageViewAnalytics />
            {getLayout(
                <Component {...pageProps} />
            )}
        </Provider>
    )
}


export default App
