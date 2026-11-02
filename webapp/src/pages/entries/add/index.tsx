"use client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"
import { EProcessingState, IUploadStatus } from "@/src/types"
import {
    AddEntryView,
} from "@/src/components/Views"
import {
    ProjectSummary,
    ProjectDetails,
} from "@/src/components"
import { RootState, setNewEntryForm, setUplaodStatus } from "@/src/store"


export default function AddEntryPage() {
    const router = useRouter()
    const dispatch = useDispatch()

    const uploadStatus: IUploadStatus = useSelector(
        (state: RootState) => state.submissions.uploadStatus
    )
    const newEntryForm = useSelector(
        (state: RootState) => state.submissions.newEntryForm
    )
    const [isShowPreview, setIsShowPreview] = useState<boolean>(true)
    const [previewView, setPreviewView] = useState<"card" | "details">("card")

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


    function isLoading() {
        return uploadStatus.state === EProcessingState.uploading
    }


    return (
        <div className="
                grid grid-cols-1 lg:grid-cols-[minmax(0,40rem)_minmax(0,1fr)]
                w-full max-w-[80rem] mx-auto
                items-start
                p-4 gap-6
            "
        >
            <AddEntryView 
                className={!isLoading() ? "p-4" : ""}
            />

            <div className="flex flex-col lg:sticky lg:top-4 w-full gap-4">
                <div>
                    <button 
                        type="button"
                        className="doom-btn"
                        aria-expanded={isShowPreview}
                        onClick={() => setIsShowPreview(!isShowPreview)}
                    >
                        {isShowPreview ? "Hide" : "Show"} Preview
                    </button>
                </div>

                <div className={`w-full flex flex-col gap-4 ${isShowPreview ? "" : "hidden"}`}>
                    <div role="group" aria-label="Preview type" className="preview-toggle flex gap-2">
                        {(["card", "details"] as const).map(view => (
                            <button
                                key={view}
                                type="button"
                                className="doom-btn-secondary px-3 h-9"
                                aria-pressed={previewView === view}
                                onClick={() => setPreviewView(view)}
                            >
                                {view === "card" ? "In the archive" : "Project page"}
                            </button>
                        ))}
                    </div>

                    {previewView === "card"
                        ? <ProjectSummary
                            item={newEntryForm}
                            projectHref="#"
                            onProjectClick={event => event.preventDefault()}
                            tagUsage={new Map()}
                        />
                        : <ProjectDetails item={newEntryForm} />
                    }
                </div>
            </div>
        </div>
    )
} // AddEntryPage
