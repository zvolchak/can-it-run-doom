"use client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"
import { EProcessingState, IArchiveItem, IUploadStatus } from "@/src/types"
import {
    AddEntryView,
} from "@/src/components/Views"
import {
    ItemCard,
} from "@/src/components"
import { RootState, setNewEntryForm, setUplaodStatus } from "@/src/store"
// import { IsSessionExpired } from "@/src/utils"


export default function AddEntryPage() {
    const router = useRouter()
    const dispatch = useDispatch()

    const uploadStatus: IUploadStatus = useSelector(
        (state: RootState) => state.submissions.uploadStatus
    )
    const [previewItem, setPreviewItem] = useState<IArchiveItem>(null)
    const [isShowPreview, setIsShowPreview] = useState<boolean>(true)

    useEffect(() => {
        // if (IsSessionExpired())
        //     router.push("/login")

        const handleRouteChange = () => {
            // Reset form state on change of route, so that it is fresh when returning
            // back to this page.
            dispatch(setUplaodStatus({ state: EProcessingState.none, message: null }))
            dispatch(setNewEntryForm(null))
        }
    
        router.events.on("routeChangeComplete", handleRouteChange)
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange)
        }
    }, [dispatch, router])


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
