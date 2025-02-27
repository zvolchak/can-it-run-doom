import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useSelector, useDispatch, } from "react-redux"
import { RootState } from "@/src/store"
import { IUserData } from "@/src/types"
import Cookies from "js-cookie"
import {
    signOut,
} from "@/src/api"
import {
    setUserData,
} from "@/src/store"


export function BtnUserAccount() {
    const router = useRouter()
    const dispatch = useDispatch()
    const [isOpen, setIsOpen] = useState(false)
    const user: IUserData = useSelector((state: RootState) => state.user.data)
    const btnText = user?.id ? "Account" : "Sign In"
    const menuRef = useRef(null)

    
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])


    async function onSignOutClicked() {
        const hasSignedOut = await signOut()
        if (!hasSignedOut)
            return

        dispatch(setUserData(null))
        Cookies.remove("user")
    } // onSignOutClicked


    function onBtnClicked() {
        if (user?.id)
            setIsOpen(!isOpen)
        else {
            setIsOpen(false)
            router.push({
                pathname: "/login",
            })
        }
    } // onBtnClicked


    return (
        <div className="relative" ref={menuRef}>
            <button 
                className="doom-btn doom-color-secondary doom-text-shadow-danger"
                onClick={() => onBtnClicked()}
            >
                {btnText}
            </button>
            {isOpen && user?.id && (
                <div className="absolute left-0 bottom-4 mb-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                    <ul className="py-1 text-white">
                        <li>
                            <Link href="/manage-entries" className="block px-4 py-2 hover:bg-gray-700">
                                Add / Edit Entries
                            </Link>
                        </li>
                        <li>
                            <button 
                                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                                onClick={onSignOutClicked}
                            >
                                Sign Out
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    )
}
