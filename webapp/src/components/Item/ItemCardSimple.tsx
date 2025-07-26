import { useDispatch, } from "react-redux"
import { 
    IArchiveItem, 
    ISource,
} from "@/src/types"
import { 
    selectItem,
} from "@/src/store"
import { 
    ImageLoader,
    ItemContentRow,
    ItemField,
} from "@/src/components"


interface IItemCardProps {
    item: IArchiveItem
    className?: string
}


export const ItemCardSimple = ({ item, className = "", }: IItemCardProps) => {
    const dispatch = useDispatch()

    function onItemClicked() {
        dispatch(selectItem(item))
    } // onIdClick


    return (
        <div className={`overflow-y-auto cursor:pointer ${className}`}
            onClick={onItemClicked}
        >
            <div className="flex flex-row p-2 h-16">
                {item?.title || ""}
            </div>

            <div 
                className={`
                    flex flex-col gap-0
                `}
            >
                <div className="gap-1 h-52 bg-black">
                    <ImageLoader 
                        className="w-full h-full"
                        src={item?.previewImg} 
                    />
                </div>

                <div className="w-full text-right px-3 py-1">
                    {item?.publishDate} 
                </div>

                {/* <RowMultiline 
                    title={`${item.authors.length > 1 ? "Authors" : "Author"}`}
                    items={[...item?.authors, { name: "test", url: "localhost" }]} 
                    hoverIconSrc="/icons/doom-guy-scream.png" 
                    className=""
                /> */}

                <div className="
                    flex flex-row flex-wrap gap-1
                    mt-2 w-full justify-end 
                    px-3
                    "
                >
                    {
                        item?.authors?.map((author: ISource) => 
                            <ItemContentRow 
                                key={`item_field_author_${author.name}`}
                                value={author.name} 
                            />

                            // <ItemField 
                            //     key={`item_field_author_${author.name}`}
                            //     label={author.name}
                            //     url={author.url}
                            //     className="bg-slate-700 px-2"
                            // />
                        )
                    }
                </div>

                <div className="flex flex-col gap-1 mt-2 w-full items-end px-3">
                    {
                        item?.sourcesUrl?.map((source: ISource, index: number) => 
                            <>
                                <ItemField 
                                    key={`item_key_source_${source.name}_${index}`}
                                    label={source.name}
                                    url={source.url}
                                />
                            </>
                        )
                    }
                </div>

            </div>
        </div>
    )
}
