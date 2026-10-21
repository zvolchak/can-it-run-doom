import { 
    IArchiveItem, 
} from "@/src/types"
import { 
    AuthorsField,
    ImageLoader,
    ItemContentRow,
    MediaField,
    SourceCodeField,
    TagsField,
} from "@/src/components"
import { useProjectLink } from "../Containers/ProjectNavigation"


interface IItemCardProps {
    item: IArchiveItem
    className?: string
}


export const ItemCardSimple = ({ item, className = "", }: IItemCardProps) => {
    const projectLink = useProjectLink()
    return (
        <div className={`overflow-y-auto ${className}`}
        >
            <div className="flex flex-row p-2 h-20">
                {item?.title || ""}
            </div>

            <ItemContentRow value={item?.publishDate} className="mt-4" />

            <div 
                className={`
                    flex flex-col gap-0 h-full
                `}
            >
                <div className="image-preview sm:h-[12rem]">
                    <ImageLoader className="h-full" src={item?.previewImg} />
                </div>

                <div className="mt-5">
                    <AuthorsField item={item} />
                </div>
                <MediaField item={item} />
                <SourceCodeField item={item} />

                <div className="hidden sm:block">
                    <TagsField item={item} className="justify-end sm:gap-2"/>
                </div>

            </div>

            <div className="w-full flex flex-row justify-center items-center m-0 p-0">
                <a {...projectLink(item.id)} className="project-preview-trigger"
                    aria-label={`View project: ${item.title}`}>View project <span aria-hidden="true">→</span></a>
            </div>
        </div>
    )
}
