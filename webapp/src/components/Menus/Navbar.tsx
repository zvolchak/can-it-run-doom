import Image from "next/image"
import { useSelector, useDispatch, } from "react-redux"
import { useRouter } from "next/router"
import Link from "next/link"
import { FaCaretDown } from "react-icons/fa"
import { FaCaretUp } from "react-icons/fa"
import { 
    BtnUserAccount,
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
    const dispatch = useDispatch()
    const router = useRouter()
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


    function IsHomePage() {
        return router.pathname === "/"
    }


    return (
        <nav className="
            sm:flex sm:flex-row sm:items-center sm:px-6 lg:px-8 sm:pb-0
            sm:sticky top-0 z-20
            relative
            flex flex-col 
            px-2
            min-h-16
            bg-gray-800
            pb-3
            "
        >
            <div className="mt-5 sm:mt-0">
                <Link href="/"> 
                    <Image src="/favicon.ico" alt="can it run doom?" width={40} height={40} />
                </Link>
            </div>

            <div className="
                    flex sm:justify-start items-center flex-1 order-1
                    mt-5 sm:mt-0
                    sm:ml-2
                "
            >
                { IsHomePage() &&
                    <button
                        className="doom-btn flex flex-row gap-1 mr-6 doom-color-slate"
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
                }
                { !IsHomePage() &&
                    <button
                        className="doom-btn flex flex-row gap-1 mr-6 doom-color-slate"
                        onClick={() => router.push("/")}
                    >
                        Home
                    </button>

                }
                <Searchbar className="sm:w-2/6 w-full" />
            </div>


            <div className="
                    flex items-center justify-end order-3 gap-2
                    sm:py-0
                    mt-6 sm:mt-0
                "
            >
                <BtnUserAccount direction="bottom" />

                <div className="flex items-center py-2 sm:py-0 ml-10">
                    <div className="flex gap-10 sm:gap-3">
                        <div className="nav-icon" onClick={handleSourceCodeClick}>
                            <Image
                                src="/icons/github-mark-white.png"
                                alt="source code"
                                width={24}
                                height={24}
                                className="rounded-full sm:ml-4 cursor-pointer"
                            />
                        </div>
                        <div className="nav-icon" onClick={handleJoinDiscordClick}>
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
            </div>
        </nav>
    )
}
