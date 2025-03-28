import { useState } from "react"
import {
    AddEntryView,
} from "@/src/components/Views"
import {
    ItemCard,
    LoadingIcon,
} from "@/src/components"
import { EProcessingState, IArchiveItem, IUploadStatus } from "@/src/types"
import { useSelector } from "react-redux"
import { RootState } from "@/src/store"


export default function AddEntryPage() {
    const uploadStatus: IUploadStatus = useSelector(
        (state: RootState) => state.submissions.uploadStatus
    )
    const [previewItem, setPreviewItem] = useState<IArchiveItem>(null)
    const [isShowPreview, setIsShowPreview] = useState<boolean>(true)

    function onEntryChanged(incoming: IArchiveItem) {
        const nextState = { 
            ...incoming,
            id: "112233",
            tags: (incoming.tags || []).filter(t => t.trim() !== "") || [],

        }
        setPreviewItem(nextState)
    } // onEntryChanged


    function isLoading() {
        return uploadStatus.state === EProcessingState.uploading
    }


    return (
        <div className={`
            flex sm:flex-row flex-col
            min-h-screen 
            w-full 
            items-start 
            justify-center
            p-4
            gap-5
        `}
        >
            <div className="flex flex-row">
                <AddEntryView 
                    className={`
                        doom-bg-alt 
                        w-3/6 sm:max-w-[55rem] sm:min-w-[45rem]
                        ${!isLoading() ? "p-4" : ""}
                    `}
                    onChange={onEntryChanged}
                />
            </div>

            <div className={`
                    flex flex-col sm:sticky sm:top-0 w-full
                `}
            >
                <div className="w-32">
                    <button 
                            className="doom-btn"
                            onClick={() => setIsShowPreview(!isShowPreview)}
                        >
                            {isShowPreview ? "Hide" : "Show"} Preview
                    </button>
                </div>

                <div className={`
                    pt-16
                    w-full
                    ${isShowPreview ? "block" : "hidden"}
                    `}
                >
                    <ItemCard 
                        item={previewItem}                
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    )
} // AddEntryPage
