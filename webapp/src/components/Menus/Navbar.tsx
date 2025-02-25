import Image from "next/image"
import { useRouter } from "next/router"
import { useSelector, useDispatch, } from "react-redux"
import Link from "next/link"
import { FaCaretDown } from "react-icons/fa"
import { FaCaretUp } from "react-icons/fa"
import { 
    Searchbar, 
} from "@/src/components"
import {
    RootState,
    setIsFiltersMenu,
} from "@/src/store"
import {
    ISettingsStoreState,
} from "@/src/types"


export const Navbar = () => {    
    const router = useRouter()
    const dispatch = useDispatch()
    const settings: ISettingsStoreState = useSelector((state: RootState) => state.settings)

    function handleSourceCodeClick() {
        const url = process.env.NEXT_PUBLIC_SOURCE_CODE_URL
        window.open(url, "_blank")
    }

    function handleJoinDiscordClick() {
        const url = process.env.NEXT_PUBLIC_DISCORD_URL
        window.open(url, "_blank")
    }


    function onFiltersBtnClicked() {
        dispatch(setIsFiltersMenu(!settings.isFiltersMenu))
    }


    return (
        <nav className="
            sm:flex sm:flex-row sm:items-center sm:px-6 lg:px-8 sm:pb-0
            relative
            flex flex-col 
            px-2 w-full
            min-h-16
            bg-gray-800
            sm:sticky top-0 z-10
            pb-3
            "
        >
            <div className="flex items-center py-2 sm:py-0">
                <Link href="/"> 
                    <Image src="/favicon.ico" alt="can it run doom?" width={40} height={40} />
                </Link>

                <div className="flex order-1 ml-10">
                    <div className="nav-icon" onClick={handleSourceCodeClick}>
                        <Image
                            src="/icons/github-mark-white.png"
                            alt="source code"
                            width={24}
                            height={24}
                            className="rounded-full sm:ml-4 cursor-pointer"
                        />
                    </div>
                    <div className="nav-icon ml-5" onClick={handleJoinDiscordClick}>
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

            <div className="
                    flex sm:justify-center items-center flex-1 order-2
                    sm:py-0
                    py-2
                "
            >
                <button
                    className="doom-btn flex flex-row gap-1 mr-3 doom-color-slate"
                    onClick={onFiltersBtnClicked}
                >
                    {   settings?.isFiltersMenu &&
                        <FaCaretUp size="20px" />
                    }
                    {   !settings?.isFiltersMenu &&
                        <FaCaretDown size="20px" />
                    }

                    Filter
                </button>
                <Searchbar className="sm:w-2/6 w-full" />
            </div>


            <div className="
                    flex items-end order-3 gap-3
                    sm:py-0
                    mt-3
                "
            >
                { router.pathname !== "/" &&
                    <Link href="/" className="doom-btn">
                            Home
                    </Link>
                }
                <Link 
                    href="/manage-entries/add"
                    className="doom-btn"
                >
                        Add New
                </Link>
            </div>
        </nav>
    )
}
