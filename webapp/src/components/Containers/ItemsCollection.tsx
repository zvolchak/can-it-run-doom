import { IArchiveItem, IItemCollection } from "@/src/types"
import { ItemCardMini } from "@/src/components"
import { useDispatch, useSelector } from "react-redux"
import { RootState, setCollection } from "@/src/store"

interface IProps {
    collection: string
    compute: () => IArchiveItem[]
}


export function ItemsCollection({ 
    collection,
    compute,
}: IProps) {
    const dispatch = useDispatch()

    const collections: IItemCollection = useSelector((state: RootState) => state.submissions.collections)
    const maxTitleLength = 80

    if (collections === null || !collections[collection]) {
        const items =  compute()
        const result = {}
        result[collection] = items
        dispatch(setCollection(result))
    }

    return (
        <>
            {
                collections?.[collection]?.map((item: IArchiveItem) => 
                    <ItemCardMini 
                        key={`doom port item for ${item.title}`} item={item} 
                        className="
                            item flex flex-col text-slate-50 gap-0
                            w-40
                        "
                    >
                        <div className="text-sm h-16">
                            {item.title.slice(0,maxTitleLength).trim()}
                            {item.title.length > maxTitleLength ? "..." : ""}
                        </div>
                    </ItemCardMini>
                )
            }
        </>
    )
}
