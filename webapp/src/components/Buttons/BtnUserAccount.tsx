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


interface IBtnUserAccountProps {
    direction?: "top" | "bottom"
}


export function BtnUserAccount({
    direction = "top",
}: IBtnUserAccountProps) {
    const router = useRouter()
    const dispatch = useDispatch()
    const [isOpen, setIsOpen] = useState(false)
    const user: IUserData = useSelector((state: RootState) => state.user.data)
    const btnText = user?.id ? "Account" : "Sign In"
    const menuRef = useRef(null)

    const listItems = [
        { title: "Account", href: "/account" },
        { title: "Add Entry", href: "/manage-entries/add" },
        { title: "Sign Out", href: "/account", onClick: onSignOutClicked, },
    ]

    
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
                <div className={`
                    absolute 
                    ${direction === "top" ? "left-0 bottom-4 mb-2" : "right-0 top-4 mt-2"}
                    w-48 
                    bg-gray-800 
                    border border-gray-700 rounded-md 
                    shadow-lg`
                }>
                    <ul className="py-1 text-white">
                        {listItems.map((item, index) => (
                            <li key={index}>
                                <Link 
                                    href={item.href}
                                    className="block px-4 py-2 hover:bg-gray-700"
                                    onClick={() => { onBtnClicked(); item.onClick?.(); }}
                                >
                                    {item.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
