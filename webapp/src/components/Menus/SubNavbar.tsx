// import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { 
} from "@/src/components"


export const SubNavbar = () => {    
    // const [locale, setLocale] = useState("en")
    const router = useRouter()

    return (
        <nav className="
            sm:flex sm:flex-row sm:items-center sm:px-6 lg:px-8 sm:pb-0
            h-8
            relative
            flex flex-col 
            px-2 w-full
            bg-gray-700
            sticky top-14 z-10
            pb-3
            "
        >

        </nav>
    )
}
