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


export const ItemCard = ({ item, className = "", }: IItemCardProps) => {
    const dispatch = useDispatch()
    // const router = useRouter()
    const appliedFilters: IFiltersStoreState = useSelector((state: RootState) => state.appliedFilters)


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
        <div className={`
            item flex flex-col text-slate-50 gap-1
            ${className}`}
        >
            <div className="flex flex-row title p-2">
                {item?.title || ""}
            </div>

            {item?.description && item?.description.length > 0 &&
                <div className="description flex flex-row p-2 whitespace-pre-line">
                    {item?.description}
                </div>
            }

            <div className="item-container flex flex-row gap-1 items-start mt-1">
                <div className="image-preview">
                    <ImageLoader className="justify-self-start" src={item?.previewImg} />
                </div>

                <div className="
                    flex flex-col doom-card w-full gap-2
                    overflow-y-auto scrollbar-hidden"
                >
                    <RowMultiline 
                        title="Author:"
                        items={item?.authors} 
                        hoverIconSrc="/icons/doom-guy-grin.png" 
                    />
                    
                    <ItemContentRow title="Published Date:" value={item?.publishDate} />

                    <RowMultiline 
                        title="Sources:"
                        items={item?.sourcesUrl} 
                        hoverIconSrc="/icons/doom-guy-scream.png" 
                    />

                    <RowMultiline 
                        title="Source Code"
                        items={item?.sourceCodeUrl} 
                        hoverIconSrc="/icons/doom-guy-look-left.png" 
                    />


                    <ItemContentRow title="First Level Completed">
                        {item?.isFirstLevelComplete ?
                            <ImCheckmark2 className="mt-1" />
                            :
                            <GiCrossMark className="mt-1" />
                        }
                    </ItemContentRow>


                    <ItemContentRow 
                        title="ID:"
                    >
                        <a className="doom-btn" onClick={() => onIdClick(item?.id)}>
                            {item?.id}
                        </a>
                    </ItemContentRow>

                    <div className="flex flex-wrap flex-row gap-1 mt-3 p-4">
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
                    </div>
                </div>
            </div>
        </div>
    )
}
