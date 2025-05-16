import { useRouter } from "next/router"
import { useDispatch } from "react-redux"
import { setNewEntryForm } from "@/src/store"


interface IAddedEntrySuccessViewProps {
    // the title of the entry or any other identirfier that makes sense.
    title: string
    requestUrl: string
    className?: string
}


export function AddedEntrySuccessView({
    title = "",
    requestUrl = "",
    className = "",
}: IAddedEntrySuccessViewProps) {
    const router = useRouter()
    const dispatch = useDispatch()
    const trimmedTitle = title.length > 20 ? `${title.slice(0, 20)}...` : title


    function onAddNewEntryClicked() {
        dispatch(setNewEntryForm({}))
        router.push("/entries/add")
    }

    return (
        <div className={`flex flex-col h-screen items-center justify-center ${className} text-white`}>
            <p className="title">
                Thank you for your submission!
            </p>
            <p className="mt-10">
                Your submission titled &quot;{trimmedTitle}&quot; has been received for review. 
                You can monitor the status of your request 
                <a target="_blank" href={requestUrl} className="page-link"> here</a>.
            </p>

            <button 
                className="doom-btn-secondary p-2 w-60 mt-10"
                onClick={onAddNewEntryClicked}
            >
                Add Another Entry
            </button>
        </div>
    )
}
