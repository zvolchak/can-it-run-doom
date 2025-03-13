import { useEffect } from "react"
import { useDispatch, } from "react-redux"
import { useRouter } from "next/navigation"
import {
    validateSession,
} from "@/src/api"
import { getMainLayout } from "@/src/layouts"


export default function ManageEntriesPage() {
    const dispatch = useDispatch()
    const router = useRouter()

    useEffect(() => {
        async function checkSession() {
            const session = await validateSession()
            if (!session?.user) {
                router.push("/login")
            }
        }
        checkSession()
    }, [dispatch, router])

    return (
        <div 
            className="min-h-screen flex flex-col gap-4 items-center justify-center"
        >
            <div className="text-white">
                This page is under construction. Will be built soon...
            </div>
            <div className="text-slate-400">
                Add new DOOM Port entry or Edit your previous submissions.
            </div>
        </div>
    )
} // LoginPage


ManageEntriesPage.getLayout = getMainLayout
