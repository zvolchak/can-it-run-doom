import { useState } from "react"
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


interface IItemCardProps {
    item: IArchiveItem
    className?: string
}


export const ItemCard = ({ item, className = "", }: IItemCardProps) => {
    const [expandedDsc, setExpandedDsc] = useState(false)
    const maxDscLength = 180
    const isDscOverflow = (item?.description || "").length > maxDscLength

    return (
        <div className={`
            item flex flex-col text-slate-50 gap-1
            ${className}`}
        >
            <div className="flex flex-row title py-2">
                {item?.title || ""}
            </div>

            {item?.description && item?.description.length > 0 &&
                <div className="
                    description flex flex-row flex-wrap sm:p-2 items-start
                    "
                >
                    <p className="whitespace-pre-line">
                        {expandedDsc || !isDscOverflow 
                            ? item?.description || "" 
                            : (item?.description || "").slice(0, maxDscLength) + "..."
                        }
                        {isDscOverflow && (
                            <button 
                            onClick={() => setExpandedDsc(!expandedDsc)} 
                            className="doom-btn ml-2"
                            >
                                {expandedDsc ? "Show Less" : "Show More"}
                            </button>
                        )}
                    </p>
                </div>
            }

            <ItemContentRow value={item?.publishDate} className="mt-4 w-auto sm:w-1/2" />

            <div className={`
                    item-container flex flex-col sm:flex-row gap-1 items-start min-h-[20rem]
                `
                }>

                <div className="image-preview sm:h-[18rem] sm:w-[38rem]">
                    <ImageLoader className="justify-self-start" src={item?.previewImg} />
                </div>

                <div className="
                    flex flex-col doom-card w-full gap-2 h-full
                    overflow-y-auto scrollbar-hidden"
                >

                    <AuthorsField item={item} />
                    <MediaField item={item} />
                    <SourceCodeField item={item} />
                    <TagsField item={item} />

                    {/* Some footer padding */}
                    <div className="h-5">
                    </div>
                </div>
            </div>
        </div>
    )
}
