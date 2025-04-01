import { useEffect } from "react"
import { useDispatch, } from "react-redux"
import { useRouter } from "next/navigation"
import {
    LoginView,
} from "@/src/components"
import {
    validateSession,
} from "@/src/api"
import {
    setUserData,
} from "@/src/store"
import { getMainLayout } from "@/src/layouts"


export default function LoginPage() {
    const dispatch = useDispatch()
    const router = useRouter()

    useEffect(() => {
        async function checkSession() {
            const session = await validateSession()
            if (session?.user) {
                dispatch(setUserData(session.user))
            }
        }
        checkSession()
    }, [dispatch, router])

    return (
        <div className="min-h-screen flex items-start justify-center">
            <LoginView className="mt-20" />
        </div>
    )
} // LoginPage


LoginPage.getLayout = getMainLayout
