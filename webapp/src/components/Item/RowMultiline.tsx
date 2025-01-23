import Image from 'next/image'
import { 
    ISource, 
} from "@/src/types"
import { 
    ItemContentRow,
} from "."
import { isUseComma } from "@/src/utils"


interface IRowMultilineProps {
    title: string
    items: ISource[],
    hoverIconSrc: string
}


export const RowMultiline = ({ 
    title,
    items, 
    hoverIconSrc, 
}: IRowMultilineProps) => {
    return (
        <ItemContentRow 
            title={title}
        >
            {items && items.map((item: ISource, index: number) =>
                <a 
                    key={`author_name: ${item.name}`} 
                    className="relative"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {item.name}
                    {isUseComma(items, index) && <br className="my-1" />}

                    <Image
                        src={hoverIconSrc}
                        alt={`Icon ${hoverIconSrc}`}
                        className="icon"
                        width={16}
                        height={16}
                    />
                </a>
            )}
        </ItemContentRow>
    )
}
