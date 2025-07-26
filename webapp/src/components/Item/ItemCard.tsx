import { useState } from "react"
import { 
    IArchiveItem, 
    IFiltersStoreState, 
    ISource,
} from "@/src/types"
import { 
    ImageLoader,
    ItemContentRow,
    ItemField,
    Tag,
} from "@/src/components"
import { FaCode } from "react-icons/fa"
import { MdOndemandVideo } from "react-icons/md"
import { FaUserAstronaut } from "react-icons/fa"
import { isFilterApplied, RootState, setAppliedTags } from "@/src/store"
import { useSelector } from "react-redux"
import { getTagsFromItems, redirectToEntries } from "@/src/utils"
import { useRouter } from "next/router"


interface IItemCardProps {
    item: IArchiveItem
    className?: string
}


export const ItemCard = ({ item, className = "", }: IItemCardProps) => {
    const router = useRouter()
    const appliedFilters: IFiltersStoreState = useSelector((state: RootState) => state.appliedFilters)
    const isFiltersApplied: boolean = useSelector((state: RootState) => isFilterApplied(state))
    const [expandedDsc, setExpandedDsc] = useState(false)
    const maxDscLength = 180
    const isDscOverflow = (item?.description || "").length > maxDscLength

    // Use filtered items list if at least one filter is applied. Otherwise, use full items list.
    const items: IArchiveItem[] = useSelector(
        (state: RootState) => {
            return isFilterApplied(state) ? 
                    state.submissions.filtered : state.submissions.items
        }
    )
    const activeTags = isFiltersApplied ? getTagsFromItems(items) : []


    function onTagClicked(event, targetTag: string) {
        redirectToEntries(router, "tag", targetTag)
    }

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

                    <div className="
                        flex flex-row flex-wrap gap-1
                        w-full justify-center 
                        mt-2 
                        sm:mt-0 
                        "
                    >
                        {
                            item?.authors?.map((author: ISource) => 
                                <div 
                                    key={`item_field_code_${author.name}`}
                                    className="flex flex-row items-center px-2 bg-slate-700"
                                >
                                    <div>
                                        <FaUserAstronaut />
                                    </div>
                                    <ItemField 
                                        label={author.name}
                                        url={author.url}
                                        className="px-2"
                                    />
                                </div>
                            )
                        }
                    </div>

                    <div className="
                        flex flex-row flex-wrap 
                        gap-x-4 gap-2
                        sm:gap-1
                        mt-2 
                        w-full h-full items-start
                        justify-end
                        "
                    >
                        {
                            item?.sourcesUrl?.map((source: ISource) => 
                                <div 
                                    key={`item_field_code_${source.name}`}
                                    className="flex flex-row items-center"
                                >
                                    <div>
                                        <MdOndemandVideo />
                                    </div>
                                    <ItemField 
                                        label={source.name}
                                        url={source.url}
                                        className="px-2"
                                    />
                                </div>
                            )
                        }
                    </div>


                    <div className="
                        flex flex-row flex-wrap 
                        gap-3
                        sm:gap-1
                        w-full h-full
                        justify-end items-end
                        "
                    >
                        {
                            item?.sourceCodeUrl?.map((source: ISource) =>
                                <div 
                                    key={`item_field_code_${source.name}`}
                                    className="flex flex-row items-center"
                                >
                                    <div>
                                        <FaCode />
                                    </div>
                                    <ItemField 
                                        label={source.name}
                                        url={source.url}
                                        className="px-2"
                                    />
                                </div>
                            )
                        }
                    </div>


                    <div className="
                        flex flex-row flex-wrap h-auto
                        mt-2 w-full items-end 
                        "
                    >
                        <div className="
                            flex flex-row flex-wrap justify-center
                            gap-4
                            px-4 pb-5 pt-2
                            sm:gap-2
                            "
                        >
                            {
                                item?.tags?.map((tag: string) => 
                                    <Tag 
                                        key={`tag_${tag}_${Math.random()}`} 
                                        text={`#${tag}`} 
                                        queryKey="tags"
                                        onClick={onTagClicked}
                                        className={`
                                            ${
                                                appliedFilters.tags?.indexOf(tag) >= 0 
                                                ? "active" : ""
                                            }
                                            ${
                                                isFilterApplied 
                                                && activeTags?.indexOf(tag) >= 0 &&
                                                appliedFilters.tags?.indexOf(tag) < 0 
                                                ? "highlight" : ""
                                            }
                                        `}
                                    />
                                )
                            }
                        </div>
                    </div>

                    {/* Some footer padding */}
                    <div className="h-5">
                    </div>
                </div>
            </div>
        </div>
    )
}
