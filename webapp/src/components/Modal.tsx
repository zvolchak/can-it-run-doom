import React from "react"
import { CgCloseR } from "react-icons/cg"

interface IModalProps {
    open: boolean
    title?: string
    onClose?: () => void
    children?: any
}


export function Modal({ 
    open, 
    title = "",
    onClose, 
    children 
}: IModalProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="flex flex-col doom-bg-dark p-6 text-white w-1/2 relative">
                <button
                    onClick={onClose}
                    className="text-black self-end"
                >
                    <CgCloseR size={24} />
                </button>

                <hr className="my-4" />

                <h2 className="text-lg font-semibold mb-4">{title}</h2>
                {children}

            </div>
        </div>
    )
} // Modal
