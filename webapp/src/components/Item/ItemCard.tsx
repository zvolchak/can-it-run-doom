import { useState } from "react"
import { 
    IArchiveItem, 
} from "@/src/types"
import { 
    AuthorsField,
    ImageLoader,
    ItemContentRow,
    LevelCompletedField,
    MediaField,
    SourceCodeField,
    TagsField,
} from "@/src/components"
import { useRouter } from "next/router"


interface IItemCardProps {
    item: IArchiveItem
    className?: string
}


export const ItemCard = ({ item, className = "", }: IItemCardProps) => {
    const router = useRouter()
    const [expandedDsc, setExpandedDsc] = useState(false)
    const maxDscLength = 180
    const isDscOverflow = (item?.description || "").length > maxDscLength

    function onIdClicked() {
        if (isOnItemsPage())
            return

        router.push({
            pathname: "/entries",
            query: { id: item.id }
        })
    } // onIdClicked


    function isOnItemsPage() {
        const currPageId = router.query?.id
        return currPageId === item.id
    } // isOnItemsPage


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
                    item-container flex flex-col sm:flex-row gap-1 items-start
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
                    <LevelCompletedField item={item} />
                    <SourceCodeField item={item} />
                    <TagsField item={item} />

                    {/* Some footer padding */}
                    <div className="h-5 p-2">
                    </div>
                </div>
            </div>

            <div className="w-full flex flex-row justify-center items-center mt-0 p-2">
                <div 
                    className={`doom-btn ${isOnItemsPage() ? "hover:cursor-default" : ""}`}
                    onClick={onIdClicked}
                >
                    {item.id}
                </div>
            </div>
        </div>
    )
}
