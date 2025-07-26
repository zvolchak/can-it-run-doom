import React from "react"
import { CgCloseR } from "react-icons/cg"

interface IModalProps {
    open: boolean
    title?: string
    className?: string
    onClose?: () => void
    children?: any
}


export function Modal({ 
    open, 
    title = "",
    className = "",
    onClose, 
    children 
}: IModalProps) {
    if (!open) return null

    return (
        <div className={`
            flex flex-col
            fixed inset-0 justify-center items-center z-50
            h-full
            overflow-y-auto
            `}
        >
            <div 
                className="bg-black bg-opacity-50 absolute w-full h-full z-10" 
                onClick={onClose}
            />

            <div className={`
                flex flex-col items-center 
                text-white 
                m-0 p-0 
                overflow-y-auto 
                z-20
                ${className}
                `}
                
            >
                {/* <hr className="my-4 w-full mb-0" /> */}

                <h2 className="text-lg font-semibold">{title}</h2>

                {children}

                <button
                    onClick={onClose}
                    className="flex flex-row gap-2 self-end doom-btn-primary doom-btn mr-2"
                >
                    Close
                    <CgCloseR size={24} />
                </button>
            </div>
        </div>
    )
} // Modal
