import { IArchiveItem } from "@/src/types"
import { IoMdCheckboxOutline } from "react-icons/io"
import { RiCloseLargeFill } from "react-icons/ri"

interface IProps {
    item: IArchiveItem
}


export function LevelCompletedField({ item }: IProps ) {
    return (
        <div className="
            flex flex-row
            w-full justify-end items-center
            mt-2 
            px-1
            sm:mt-0 
            "
        >
            <div 
                className="flex flex-row items-center justify-end px-2 py-1 "
            >
                First Level Completed:
            </div>
            <div className="mb-1">
                {
                    item.isFirstLevelComplete &&
                    <IoMdCheckboxOutline size={22} />
                }
                {
                    !item.isFirstLevelComplete &&
                    <RiCloseLargeFill size={22} />
                }
            </div>
        </div>
    )
}
