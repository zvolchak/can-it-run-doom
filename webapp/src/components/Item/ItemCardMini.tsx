import { useDispatch, } from "react-redux"
import { 
    IArchiveItem, 
} from "@/src/types"
import { 
    selectItem,
} from "@/src/store"
import { 
    ImageLoader,
} from "@/src/components"


interface IItemCardProps {
    item: IArchiveItem
    className?: string
    children?: any
}


export const ItemCardMini = ({ item, className = "", children = null}: IItemCardProps) => {
    const dispatch = useDispatch()

    function onItemClicked() {
        dispatch(selectItem(item))
    } // onItemClicked


    const authors = [...item.authors].splice(0, 2)
    if (item?.authors.length > 2)
        authors.push({ name: "...", url: "" })


    return (
        <div className={`cursor-pointer flex flex-col gap-0 ${className}`}
            onClick={onItemClicked}
        >
            <div className="h-36 w-50 relative">
                <ImageLoader 
                    className="w-full h-full"
                    src={item?.previewImg} 
                />
            </div>

            <div className="flex flex-col gap-1 mt-2 w-full px-1">
                {children}
            </div>
        </div>
    )
}
