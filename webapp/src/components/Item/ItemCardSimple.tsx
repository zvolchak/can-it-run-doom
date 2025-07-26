// import { useDispatch, } from "react-redux"
import { 
    IArchiveItem, 
} from "@/src/types"
// import { 
//     selectItem,
// } from "@/src/store"
import { 
    AuthorsField,
    ImageLoader,
    ItemContentRow,
    MediaField,
    SourceCodeField,
    TagsField,
} from "@/src/components"


interface IItemCardProps {
    item: IArchiveItem
    className?: string
}


export const ItemCardSimple = ({ item, className = "", }: IItemCardProps) => {
    // const dispatch = useDispatch()

    // function onItemClicked() {
    //     dispatch(selectItem(item))
    // } // onIdClick


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
        </div>
    )
}
