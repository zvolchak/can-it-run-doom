import { IArchiveItem, ISource } from "@/src/types"
import { FaUserAstronaut } from "react-icons/fa"
import { ItemField } from "@/src/components"


interface IProps {
    item: IArchiveItem
}


export function AuthorsField({ item }: IProps ) {
    return (
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
    )
}
