import { IArchiveItem, IFiltersStoreState, } from "@/src/types"
import { 
    Tag,
} from "@/src/components"
import { RootState, isFilterApplied } from "@/src/store"
import { getTagsFromItems, redirectToEntries } from "@/src/utils"
import router from "next/router"
import { useSelector } from "react-redux"

interface IProps {
    item: IArchiveItem
    className?: string
}


export function TagsField({ 
    item,
    className = "",
}: IProps ) {
    const appliedFilters: IFiltersStoreState = useSelector((state: RootState) => state.appliedFilters)

    // Use filtered items list if at least one filter is applied. Otherwise, use full items list.
    const items: IArchiveItem[] = useSelector(
        (state: RootState) => {
            return isFilterApplied(state) ? 
                    state.submissions.filtered : state.submissions.items
        }
    )
    const activeTags = isFilterApplied ? getTagsFromItems(items) : []


    function onTagClicked(event, targetTag: string) {
        redirectToEntries(router, "tag", targetTag)
    }

    
    return (
        <div className={`
            flex flex-row flex-wrap h-auto
            mt-2 w-full items-end 
            ${className}
            `}
        >
            <div className={`
                flex flex-row flex-wrap justify
                gap-4
                px-4 pb-5 pt-2
                ${className}
                `}
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
    )
}
