import { useEffect } from "react"
import { useRouter } from "next/router"
import { RootState } from "@/src/store"
import { IUserData } from "@/src/types"
import { useSelector } from "react-redux"


export default function AccountPage() {
    const router = useRouter()
    const user: IUserData = useSelector((state: RootState) => state.user.data)

    useEffect(() => {
        if (!user || !user?.email)
            router.push("/")
    }, [router, user])

    return (
        <div className="min-h-screen flex flex-col w-full justify-start text-center">
            <div className="mt-10">
                <h2 className="title">
                    Account
                </h2>
            </div>

            <div>
                <button 
                    className="doom-secondary-btn w-48 mt-24"
                    onClick={() => router.push("manage-entries/add")}
                >
                    Add New Entry
                </button>
            </div>

            <div className="text-white mt-10">
            { user !== null && !user.isVerified &&
                <div>
                    An email associated with this account has not been verified yet. To 
                    complete the account creation, please, follow the link that has been 
                    sent to &quot;{user?.email}&quot;. 
                </div>
            }
            </div>
        </div>
    )

} // AddEntryPage
