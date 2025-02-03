import { useState } from "react"
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
    const [isShowIcon, setIsShowIcon] = useState(false)
    

    return (
        <ItemContentRow 
            title={title}
        >
            {items && items.map((item: ISource, index: number) =>
                <a 
                    key={`author_name: ${item.name}`} 
                    className="relative"
                    onMouseOver={() => setIsShowIcon(true)}
                    onMouseOut={() => setIsShowIcon(false)}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {item.name}
                    {isUseComma(items, index) && <br className="my-1" />}

                    <Image
                        src={hoverIconSrc}
                        alt={`Icon ${hoverIconSrc}`}
                        className={`icon ${isShowIcon ? "opacity-100" : "opacity-0"}`}
                        quality={100}
                        width={20}
                        height={20}
                    />
                </a>
            )}
        </ItemContentRow>
    )
}
