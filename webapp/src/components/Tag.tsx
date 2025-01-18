import { useRouter } from "next/router"


interface ITagProps {
    text: string
    active: boolean
    onClick?: (text: string) => {}
}


export const Tag = ({ text, active, onClick }: ITagProps) => {
    const router = useRouter()
 
    function onTagClick(e, text: string) {
        e.preventDefault()
        let queryTags = (router.query?.tag as string || "").split(",")
        const incomingTagIndex = queryTags.indexOf(text)
        queryTags = queryTags.filter(item => item || item !== "")
        if (incomingTagIndex >= 0)
            queryTags.splice(incomingTagIndex, 1)
        else
            queryTags.push(text)

        console.debug(queryTags)
        if (queryTags.length > 0) {
            router.push(`?tag=${encodeURIComponent(queryTags.join(","))}`)
        } else {
            router.replace({
                pathname: router.pathname,
                query: {},
            })
        }
    }

    return (
        <p
            key={`tag_${text}`}
            className={`p-1 tag bg-gray-700 ${active ? "active" : ""}`}
            onClick={(e) => onTagClick(e, text)}
        >
            # {text}
        </p>
    )
}


export default Tag
