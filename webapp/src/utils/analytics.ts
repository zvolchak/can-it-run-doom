import { getApps, initializeApp, type FirebaseApp } from "firebase/app"
import { 
    type Analytics,
    getAnalytics, 
    logEvent, 
    setAnalyticsCollectionEnabled, 
    setUserId,
    setUserProperties,
} from "firebase/analytics"
import { IsProd } from "@/src/utils"

let fbApp: FirebaseApp | null = null
let analyticsApp: Analytics | null = null


export function initFbApp() {
    // Analytics is browser-only; SSR and development must not initialize Firebase.
    if (!IsProd() || typeof window === "undefined")
        return { fbApp: null, analyticsApp: null }

    if (!fbApp) {
        // Firebase's registry survives module reloads; local variables do not.
        fbApp = getApps().find(app => app.name === "[DEFAULT]") ?? initializeApp({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        })
    }

    if (!analyticsApp) {
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



export function trackPageView(analyticsApp: Analytics | null, page: string, sessionId: string) {
    if (!IsProd() || typeof window === "undefined" || !analyticsApp)
        return
    if (!page || page === "")
        return
    
    logEvent(analyticsApp, "page_view", { page_path: page, sessionId })
} // trackPageView


initFbApp()

export { fbApp, analyticsApp }
