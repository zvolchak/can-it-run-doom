import { useState } from "react"
import { useSelector, useDispatch, } from "react-redux"
// import { useRouter } from "next/router"
import { ImCheckmark2 } from "react-icons/im"
import { GiCrossMark } from "react-icons/gi"
import { 
    IArchiveItem, 
    IFiltersStoreState,
} from "@/src/types"
import { 
    RootState,
    setAppliedId,
    setAppliedTags,
} from "@/src/store"
import { 
    ImageLoader,
    RowMultiline,
    ItemContentRow,
    Tag,
} from "@/src/components"


interface IItemCardProps {
    item: IArchiveItem
    className?: string
}


export const ItemCardSimple = ({ item, className = "", }: IItemCardProps) => {
    const dispatch = useDispatch()
    // const router = useRouter()
    const appliedFilters: IFiltersStoreState = useSelector((state: RootState) => state.appliedFilters)
    const [expandedDsc, setExpandedDsc] = useState(false)
    const maxDscLength = 180
    const isDscOverflow = (item?.description || "").length > maxDscLength

    function onIdClick(id: string) {
        let appliedIds = [ ...(appliedFilters.ids || [])]
        if (!appliedIds)
            appliedIds = []
        const existingIndex = appliedIds.indexOf(id)
        if (existingIndex >= 0)
            appliedIds.splice(existingIndex, 1)
        else
            appliedIds.push(id)

        dispatch(setAppliedId(appliedIds))
        // const query = { ...router.query, ids: id }
        // router.push({
        //     pathname: router.pathname,
        //     query,
        // })
    } // onIdClick
    return (
        <div className={`${className}`}
        >
            <div className="flex flex-row p-2 h-16">
                {item?.title || ""}
            </div>

            {/* {item?.description && item?.description.length > 0 &&
                <div className="description flex flex-col p-2 items-start">
                    <p className="whitespace-pre-line">
                        {expandedDsc || !isDscOverflow 
                            ? item?.description || "" 
                            : (item?.description || "").slice(0, maxDscLength) + "..."
                        }
                    </p>
                    {isDscOverflow && (
                        <button 
                        onClick={() => setExpandedDsc(!expandedDsc)} 
                        className="doom-btn pt-3"
                        >
                            {expandedDsc ? "Show Less" : "Show More"}
                        </button>
                    )}
                </div>
            } */}

            <div className={`
                    flex flex-col gap-0
                `}
            >
                <div className="gap-1 h-52 bg-black">
                    <ImageLoader 
                        className="w-full h-full"
                        src={item?.previewImg} 
                    />
                </div>

                <div className="flex flex-col gap-2 mt-2 w-full">
                    <ItemContentRow
                        title="" 
                        value={item?.publishDate} 
                    />

                    <RowMultiline 
                        title=""
                        items={item?.sourcesUrl} 
                        hoverIconSrc="/icons/doom-guy-scream.png" 
                    />

                    {
                        (!item?.sourceCodeUrl || item?.sourceCodeUrl.length !== 0) &&
                        <RowMultiline 
                            title="Source Code"
                            items={item?.sourceCodeUrl} 
                            hoverIconSrc="/icons/doom-guy-look-left.png" 
                        />
                    }
                </div>

                    <div className="
                        flex flex-col doom-card w-full gap-1
                        overflow-y-auto scrollbar-hidden
                        top-1
                        absolute
                        "
                    >
                        {/* <RowMultiline 
                            title=" "
                            items={item?.authors} 
                            hoverIconSrc="/icons/doom-guy-grin.png" 
                        /> */}
                        

                        {/* <RowMultiline 
                            title="Sources:"
                            items={item?.sourcesUrl} 
                            hoverIconSrc="/icons/doom-guy-scream.png" 
                        />

                        <RowMultiline 
                            title="Source Code"
                            items={item?.sourceCodeUrl} 
                            hoverIconSrc="/icons/doom-guy-look-left.png" 
                        /> */}


                        {/* <ItemContentRow title="First Level Completed">
                            {item?.isFirstLevelComplete ?
                                <ImCheckmark2 className="mt-1" />
                                :
                                <GiCrossMark className="mt-1" />
                            }
                        </ItemContentRow> */}


                        {/* <ItemContentRow 
                            title="ID:"
                        >
                            <a className="doom-btn" onClick={() => onIdClick(item?.id)}>
                                {item?.id}
                            </a>
                        </ItemContentRow> */}

                        {/* <div className="flex flex-wrap flex-row gap-1 mt-3 p-4">
                            {
                                item?.tags.map((tag: string) => {
                                    return <Tag 
                                        key={`tag_${tag}_${Math.random()}`} 
                                        text={tag} 
                                        queryKey="tags"
                                        onDispatch={setAppliedTags}
                                        className={`
                                            ${appliedFilters.tags?.indexOf(tag) >= 0 ? "active" : ""}
                                        `}
                                    />
                                })
                            }
                        </div> */}
                    </div>
                
            </div>
        </div>
    )
}
