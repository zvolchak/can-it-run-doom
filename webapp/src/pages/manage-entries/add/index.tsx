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
        <div className="
            flex flex-row 
            min-h-screen 
            w-full 
            items-start justify-center 
            p-4
            gap-5
            "
        >
            <AddEntryView 
                className={`
                    w-3/6 max-w-[55rem] min-w-[45rem] doom-bg-alt 
                    ${!isLoading() ? "p-4" : ""}
                `}
                onChange={onEntryChanged}
            />

            <div className="flex flex-col sticky top-0">
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
                    ${isShowPreview ? "hidden xl:block" : "hidden"}
                    `}
                >
                    <ItemCard 
                        item={previewItem}                
                    />
                </div>
            </div>
        </div>
    )
} // AddEntryPage
