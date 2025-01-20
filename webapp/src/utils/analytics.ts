import { initializeApp } from "firebase/app"
import { 
    Analytics, 
    getAnalytics, 
    logEvent, 
    setAnalyticsCollectionEnabled, 
    setUserId,
    setUserProperties,
} from "firebase/analytics"
import { IsProd } from "@/src/utils"

let fbApp = null
let analyticsApp = null


export function initFbApp() {
    if (fbApp !== null && analyticsApp !== null) {
        return { fbApp, analyticsApp }    
    }

    if (!IsProd)
        return { fbApp: null, analyticsApp: null }

    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
    
    fbApp = initializeApp(firebaseConfig)
    if (typeof window !== "undefined") {
        analyticsApp = getAnalytics(fbApp)
        // Disable user data collection
        setAnalyticsCollectionEnabled(analyticsApp, false)
        // Disable user ID assignment
        setUserId(analyticsApp, null)
        // Disable google's Ad id assignment
        setUserProperties(analyticsApp, { allow_ad_personalization_signals: false })
    }

    return { fbApp, analyticsApp }
} // initFbApp



export function trackPageView(analyticsApp: Analytics, page: string, sessionId: string) {
    if (!IsProd() || !analyticsApp)
        return
    if (!page || page === "")
        return

    logEvent(analyticsApp, "page_view", { page_path: page, sessionId })
} // trackPageView


export { fbApp, analyticsApp }
