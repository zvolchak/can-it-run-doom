interface ITagProps {
    text: string
    active: boolean
    onClick?: (text: string) => {}
}

export const Tag = ({ text, active, onClick }: ITagProps) => {
    return (
        <p
            key={`tag_${text}`}
            className={`p-1 tag bg-gray-700 ${active ? "active" : ""}`}
            onClick={(e) => onClick?.(text)}
        >
            # {text}
        </p>
    )
}


export default Tag
