import { useState, useEffect } from "react"
import Link from 'next/link'
import { IoMdClose } from "react-icons/io"
import { RxHamburgerMenu } from "react-icons/rx"

interface ISidebarProps {
    active?: boolean
    onToggle?: (state: boolean) => void
    children: React.ReactNode
}


export const Sidebar: React.FC<ISidebarProps> = ({ 
    active = false,
    onToggle,
    children,
}) => {
    const [isOpen, setIsOpen] = useState(active)

    useEffect(() => {
        setIsOpen(active)
    }, [active])

    return (
        <>
            <button
                onClick={() => { setIsOpen(true); onToggle?.(true); } }
                className="ml-5 text-white"
            >
                <RxHamburgerMenu size="24px" />
            </button>

            <div
                className={`flex flex-col sidebar ${isOpen ? "open" : ""}`}
            >
                <div className="grid grid-cols-2 p-3">
                    <div className="flex w-80 pl-4">
                        <Link href="/"  onClick={() => { setIsOpen(false); onToggle?.(false); }}>
                            <h1 className="text-white text-xl mr-14 block">Can It Run Doom</h1>
                        </Link>
                    </div>

                    <button
                        onClick={() => { setIsOpen(false); onToggle?.(false); }}
                        className="p-1 justify-self-end"
                    >
                        <IoMdClose />
                    </button>
                </div>

                <hr className="h-px my-4 border-2 border-slate-600 dark:bg-gray-600" />
                
                <div className="p-4 pl-10">
                    {children}
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 h-screen bg-slate-800 opacity-50 z-10"
                    onClick={() => { setIsOpen(false); onToggle?.(false); }}
                />
            )}
        </>
    )
}
