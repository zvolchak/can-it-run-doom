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
    hoverIconSrc: string,
    className?: string
}


export const RowMultiline = ({ 
    title,
    items, 
    hoverIconSrc,
    className = "",
}: IRowMultilineProps) => {
    const [hoveredItem, setHoveredItem] = useState(null)

    return (
        <ItemContentRow 
            title={title}
            className={className}
        >
            {items && items.map((item: ISource, index: number) =>
                <a 
                    key={`author_name: ${item.name}`} 
                    className="doom-btn relative"
                    onMouseOver={() => setHoveredItem(item.name)}
                    onMouseOut={() => setHoveredItem(null)}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {item.name}
                    {isUseComma(items, index) && <br className="my-1" />}

                    <Image
                        src={hoverIconSrc}
                        alt={`Icon ${hoverIconSrc}`}
                        className={`
                            icon 
                            ${hoveredItem === item.name ? "opacity-100" : "opacity-0"}
                        `}
                        quality={100}
                        width={20}
                        height={20}
                    />
                </a>
            )}

            { (!items || items?.length === 0) && 
                <div>N/A</div>
            }
        </ItemContentRow>
    )
}
