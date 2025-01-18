import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/router"
import { Searchbar } from "@/src/components"


export const Navbar = () => {
    const [locale, setLocale] = useState("en")
    const router = useRouter()

    const routes = [
        { localeVar: "Home", name: "Home", path: "/" },
    ]

    useEffect(() => {
        const sysLang = document.cookie.split("; ")
            .find((row) => row.startsWith("lang="))?.split("=")[1] || "en"
        setLocale(sysLang)
    }, [])

    const handleLocaleChange = (target) => {
        document.cookie = `lang=${target}`
        setLocale(target)
    }

    const handleSourceCodeClick = () => {
        const url = process.env.NEXT_PUBLIC_SOURCE_CODE_URL
        window.open(url, "_blank")
    }

    const handleJoinDiscordClick = () => {
        const url = process.env.NEXT_PUBLIC_DISCORD_URL
        window.open(url, "_blank")
    }


    return (
        <nav className="
            sm:flex sm:flex-row sm:items-center sm:px-6 lg:px-8 sm:pb-0
            relative
            flex flex-col 
            px-2 min-h-16 w-full
            bg-gray-800
            sticky top-0 z-10
            pb-3
            "
        >
            <div className="flex items-center py-2 sm:py-0">
                <Image src="/favicon.ico" alt="can it run doom?" width={40} height={40} />

                <div className="flex order-1 ml-10">
                    <select
                        className="dropdown nav-btn mr-10"
                        value={locale}
                        onChange={(e) => handleLocaleChange(e.target.value)}
                    >
                        {["en", "fr", "es"].map((loc) => (
                            <option key={`locale-${loc}`} value={loc}>
                                {loc.toUpperCase()}
                            </option>
                        ))}
                    </select>

                    <div className="w-12 nav-icon" onClick={handleSourceCodeClick}>
                        <Image
                            src="/icons/github-mark-white.png"
                            alt="source code?"
                            width={24}
                            height={24}
                            className="rounded-full sm:ml-4 cursor-pointer"
                        />
                    </div>
                    <div className="w-12 nav-icon" onClick={handleJoinDiscordClick}>
                        <Image
                            src="/icons/discord-48.png"
                            alt="discord server"
                            width={24}
                            height={24}
                            className="rounded-full sm:ml-4 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <Searchbar className="order-2" />
        </nav>
    )
}

export default Navbar
