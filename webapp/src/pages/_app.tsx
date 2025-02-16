import "@/src/styles/globals.scss"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { Provider, useDispatch, useSelector, } from "react-redux"
import { v4 as uuidv4 } from 'uuid'
import { 
    RootState,
    store,
    setUserSessionId,
    setUserData,
} from "@/src/store"
import { analyticsApp, trackPageView } from "@/src/utils/analytics"
import { validateSession } from "@/src/api"
import {
    Navbar,
    Footer,
} from "@/src/components"


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


function SessionValidator() {
    const dispatch = useDispatch()
    const router = useRouter()
  
    useEffect(() => {
        async function validateUserSession() {
            try {
                const response = await validateSession()
                if (response?.user) {
                    dispatch(setUserData(response.user))
                }
            } catch (error) {
                console.error("Session validation failed:", error)
            }
        }
        validateUserSession()
    }, [dispatch, router])
  
    return null
} // SessionValidator


function PageViewAnalytics() {
    const router = useRouter()
    const userSessionId: string = useSelector((state: RootState) => state.user?.data?.sessionId) || ""
    const [isInitPageLoad, setIsInitPageLoad] = useState(false)

    useEffect(() => {
        if (!userSessionId)
            return

        const handleRouteChange = (url) => {
            trackPageView(analyticsApp, url, userSessionId)
        }

        if (!isInitPageLoad) {
            handleRouteChange(router.asPath)
            setIsInitPageLoad(true)
        }
        router.events.on("routeChangeComplete", handleRouteChange)

        return () => {
            router.events.off("routeChangeComplete", handleRouteChange)
        }
    }, [router, userSessionId, isInitPageLoad, setIsInitPageLoad])

    return null
} // PageViewAnalytics


function App({ Component, pageProps }) {
    const getLayout = Component.getLayout || ((page) => page)

    return (
        <Provider store={store}>
            <SessionValidator />
            <UserSessionInit />
            <PageViewAnalytics />
            <Navbar />
            {getLayout(
                <Component {...pageProps} />
            )}
            <Footer />
        </Provider>
    )
}


export default App
