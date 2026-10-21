import { 
    IArchiveItem, 
} from "@/src/types"
import { useProjectLink } from "../Containers/ProjectNavigation"
import { 
    ImageLoader,
} from "@/src/components"


interface IItemCardProps {
    item: IArchiveItem
    className?: string
    children?: any
}


export const ItemCardMini = ({ item, className = "", children = null}: IItemCardProps) => {
    const projectLink = useProjectLink()
    return (
        <a {...projectLink(item.id)} className={`project-mini-trigger cursor-pointer flex flex-col gap-0 ${className}`}
            aria-label={`View project: ${item.title}`}
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
        </a>
    )
}
