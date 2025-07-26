import { IArchiveItem, ISource } from "@/src/types"
import { ItemField } from "../ItemField"
import { MdOndemandVideo } from "react-icons/md"


interface IProps {
    item: IArchiveItem
}


export function MediaField({ item }: IProps ) {
    return (
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
    )
}
