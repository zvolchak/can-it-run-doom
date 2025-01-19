import { ImCheckmark2 } from "react-icons/im"
import { GiCrossMark } from "react-icons/gi"
import { 
    IArchiveItem, 
} from "@/src/types"
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

    return (
        <div className={`
            item flex flex-col text-slate-50 gap-1
            sm:w-full
            md:w-3/4
            lg:w-3/5
            2xl:w-5/12
            w-full
            ${className}`}
        >
            <div className="flex flex-row title">
                {item.title}
            </div>

            <div className="description flex flex-row">
                {item.description}
            </div>

            <div className="item-container flex flex-row gap-1 items-start mt-5">
                <div className="image-preview">
                    <ImageLoader className="justify-self-start" src={item.previewImgUrl} />
                </div>

                <div className="
                    flex flex-col doom-card w-full gap-2
                    overflow-y-scroll scrollbar-hidden"
                >
                    <RowMultiline 
                        title="Author:"
                        items={item.authors} 
                        hoverIconSrc="/icons/doom-guy-grin.png" 
                    />
                    
                    <ItemContentRow title="Published Date:" value={item.publishDate} />

                    <RowMultiline 
                        title="Sources:"
                        items={item.sourcesUrl} 
                        hoverIconSrc="/icons/doom-guy-grin.png" 
                    />

                    <ItemContentRow title="First Level Completed">
                        {item.isFirstLevelComplete ?
                            <ImCheckmark2 className="mt-1" />
                            :
                            <GiCrossMark className="mt-1" />
                        }
                    </ItemContentRow>

                    <ItemContentRow title="ID:" value={item.id} />

                    <div className="flex flex-wrap flex-row gap-1 mt-3 p-4">
                        {
                            item.tags.map((tag: string) => {
                                return <Tag key={`tag_${tag}`} text={tag} />
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}