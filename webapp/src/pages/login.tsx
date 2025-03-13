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
                router.push("/")
            }
        }
        checkSession()
    }, [dispatch, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800">
            <LoginView />
        </div>
    )
} // LoginPage


LoginPage.getLayout = getMainLayout
