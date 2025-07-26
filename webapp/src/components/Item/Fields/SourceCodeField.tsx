import { IArchiveItem, ISource } from "@/src/types"
import { FaCode } from "react-icons/fa"
import { ItemField } from "../ItemField"


interface IProps {
    item: IArchiveItem
}


export function SourceCodeField({ item }: IProps ) {
    return (
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
    )
}
