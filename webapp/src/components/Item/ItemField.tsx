import { useState } from "react"
import Image from 'next/image'


interface IProps {
    label: string
    url: string,
    hoverIconSrc?: string,
    className?: string
}


export const ItemField = ({ 
    label,
    url, 
    hoverIconSrc = null,
    className = "",
}: IProps) => {
    const [hoveredItem, setHoveredItem] = useState(null)

    return (
        <a 
            className={`
                doom-btn relative flex flex-col items-end py-1
                ${className}
                `}
            onMouseOver={() => setHoveredItem(label)}
            onMouseOut={() => setHoveredItem(null)}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
        >
            {label}

            { hoverIconSrc !== null &&
                <Image
                    src={hoverIconSrc}
                    alt={`Icon ${hoverIconSrc}`}
                    className={`
                        icon
                        ${hoveredItem === label ? "opacity-100" : "opacity-0"}
                    `}
                    quality={100}
                    width={20}
                    height={20}
                />
            }
        </a>
    )
}
