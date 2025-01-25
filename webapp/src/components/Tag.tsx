import { useRouter } from "next/router"


interface ITagProps {
    text: string
    queryKey: string
    className?: string
}


export const Tag = ({ 
    text, 
    queryKey,
    className = "", 
}: ITagProps) => {
    const router = useRouter()
 
    function onTagClick(e, text: string) {
        e.preventDefault()

        const query = router.query
        const values = (decodeURIComponent(query[queryKey] as string) || "").split(",")
            .filter(item => item && item !== "" && item !== "undefined")
        const incomingTagIndex = values.indexOf(text)
        if (incomingTagIndex >= 0)
            values.splice(incomingTagIndex, 1)
        else
            values.push(text)

        if (values.length > 0) {
            query[queryKey] = encodeURIComponent(values.join(","))
        } else {
            delete query[queryKey]
        }

        router.push(
            {
                pathname: router.pathname,
                query: query
            }, 
            undefined, 
            { scroll: false }
        )
    } // onTagClick

    return (
        <p
            key={`tag_${text}`}
            className={`p-1 tag bg-gray-700 ${className}`}
            onClick={(e) => onTagClick(e, text.replace("#", ""))}
        >
            {text}
        </p>
    )
}


export default Tag
