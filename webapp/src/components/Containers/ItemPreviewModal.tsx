import { getMainLayout } from "@/src/layouts"
import { 
    IArchiveItem,
} from "@/src/types"
import {
    Modal,
    ItemCard,
} from "@/src/components"
import React, { useEffect } from "react"
import { RootState, selectItem } from "@/src/store"
import { useDispatch, useSelector } from "react-redux"


interface IItemPreviewModalProps {
    item: IArchiveItem | null,
    className?: string,
}


export function ItemPreviewModal({ 
    item, 
    className="" 
}: IItemPreviewModalProps) {
    const dispatch = useDispatch()
    const selectedItem: IArchiveItem = useSelector((state: RootState) => state.submissions.selected)
    const isOpened = item !== null

    useEffect(() => {
        if (isOpened) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }

        return () => {
            document.body.style.overflow = ""
        }
    }, [isOpened])

    if (!isOpened) return null

    function onItemPreviewClose() {
        dispatch(selectItem(null))
    } // onItemPreviewClose

    
    return (
        <div className={`${className}`}>
            { selectedItem !== null && 
                <Modal 
                    open={selectedItem !== null}
                    title={""}
                    onClose={onItemPreviewClose}
                    className="flex flex-row w-full sm:w-auto"
                >
                    <ItemCard 
                        item={item} 
                        className="w-full sm:w-8/12 sm:px-8 px-3"
                    />
                </Modal>
            }
        </div>
    )
} // MainPage


ItemPreviewModal.getLayout = getMainLayout
