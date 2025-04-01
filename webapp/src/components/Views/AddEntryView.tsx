import { useState, useRef, } from "react"
import { FaRegWindowClose } from "react-icons/fa"
import { useSelector, useDispatch, } from "react-redux"
import {
    addNewEntry,
} from "@/src/api"
import {
    InputWithLabel,
    LoadingIcon,
    SourcesInputField,
} from "@/src/components"
import { IArchiveItem, ISource, IUploadStatus, EProcessingState, } from "@/src/types"
import { RootState, setNewEntryForm, setUplaodStatus, } from "@/src/store"
import { AddedEntrySuccessView } from "./ResponseViews/AddedEntrySuccessView"


interface IAddEntryViewProps {
    className?: string
    values?: IArchiveItem
    onChange?: (item: any) => void
}


export function AddEntryView({ 
    className = "",
    onChange = null,
}: IAddEntryViewProps) {
    const dispatch = useDispatch()
    const formData: IArchiveItem = useSelector(
        (state: RootState) => state.submissions.newEntryForm
    )
    const uploadStatus: IUploadStatus = useSelector(
        (state: RootState) => state.submissions.uploadStatus
    )

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [entryResponse, setEntryResponse] = useState(null)
    const authorInputRef = useRef<{ getAllInputs: () => string[][] } | null>(null)
    const sourcesInputRef = useRef<{ getAllInputs: () => string[][] } | null>(null)
    const sourceCodeInputRef = useRef<{ getAllInputs: () => string[][] } | null>(null)

    function handleChange(e) {
        const { name, value, type, checked, files } = e.target
        const nextState = {
            ...formData,
            [name]: type === "checkbox" ? checked : value
        }

        if (name === "tags") {
            nextState[name] = value.split(",")
        } else {
            nextState[name] = type === "checkbox" ? checked : value
        }

        if (files) {
            setImageFile(files[0] || null)
        }
        
        dispatch(setNewEntryForm(nextState))
        onChange?.(nextState)
    } // handleChange


    function onSourcesInputChanged(inputs: ISource[], key: string) {
        const nextState = { ...formData }
        if (!nextState[key])
            nextState[key] = []
        
        nextState[key] = inputs
        dispatch(setNewEntryForm(nextState))
        onChange?.(nextState)
    } // onSourcesInputChanged


    function getInputs() {
        const inputsData = {
            authors: (authorInputRef.current.getAllInputs() as any) || [],
            sourcesUrl: (sourcesInputRef.current.getAllInputs() as any) || [],
            sourceCodeUrl: (sourceCodeInputRef.current.getAllInputs() as any) || [],
        }
        return inputsData
    } // getInputs


    async function handleSubmit(e) {
        e.preventDefault()
        const loadingTimeStart = performance.now()
        const nextState = { ...formData,  ...getInputs() }
        dispatch(setNewEntryForm(nextState))
        dispatch(setUplaodStatus({ state: EProcessingState.uploading }))

        const formDataToSend = new FormData()
        formDataToSend.append("items", JSON.stringify([formData]))
        if (imageFile) {
            formDataToSend.append("image", imageFile)
        }
        
        // doom_ports/add endpoint expects a list of items in the body.
        const response = await addNewEntry(formDataToSend)
        setEntryResponse(response?.data)

        if (response.status >= 400) {
            console.error("Failed to add an entry:", response.error)
            const message = "Failed to add an entry! Please, contact support if error persists."
            dispatch(setUplaodStatus({ 
                state: EProcessingState.error, 
                message: response.data.error || message
            })) 
        } else {
            // Show a loading spinner for at least 1 second, so that screen doesn change
            // states too fast making it, potentially easier to comprehand chain of events
            // when the "submit" button is pressed.
            const loadingTime = performance.now() - loadingTimeStart
            const delayTime = loadingTime > 1000 ? 0 : 1000 - loadingTime
            setTimeout(() => {
                dispatch(setUplaodStatus({ state: EProcessingState.success }))
            }, delayTime)
        }
    } // handleSubmit

    function isLoading() {
        return uploadStatus.state === EProcessingState.uploading
    }

    return (
        <div
            className={`
                doom-color-secondary
                doom-card 
                w-full
                ${className}
            `}
        >
            { uploadStatus?.state === "success" &&
                <AddedEntrySuccessView 
                    title={formData?.title}
                    requestUrl={entryResponse?.requestUrl || ""}
                />
            }

            { uploadStatus.state !== "success" &&
                <form 
                    onSubmit={handleSubmit} 
                    className="flex flex-col gap-6 w-full"
                >
                    <h2 className="title text-center mb-4">Add New Entry</h2>

                    <div className="">
                        <InputWithLabel 
                            required 
                            title="Title *"
                            value={formData.title} 
                            onChange={handleChange} 
                            placeholder="Title" 
                        />
                    </div>

                    <div className="mt-2">
                        <label className="block mb-1">Description</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            placeholder="Description" 
                            className="w-full" 
                        />
                    </div>

                    <div className="mt-2">
                        <label className="block mb-1">Authors</label>
                        <SourcesInputField 
                            ref={authorInputRef}
                            value={formData?.authors}
                            requiredName={true}
                            requiredUrl={true}
                            placeholderUrl="Author's profile at Reddit, YouTube, Github, etc"
                            onChange={
                                (inputs: ISource[]) => 
                                    onSourcesInputChanged(inputs, "authors")
                            } 
                        />
                    </div>

                    <div className="">
                        <InputWithLabel 
                            required 
                            title="Publish Date *"
                            value={formData.publishDate} 
                            type="date"
                            onChange={handleChange} 
                            placeholder="YYYY-MM-DD"
                            className="w-1/2" 
                        />
                    </div>

                    <div className="mt-2">
                        <label className="block mb-1">Media Source</label>
                        <SourcesInputField
                            ref={sourcesInputRef}
                            value={formData?.sourcesUrl}
                            placeholderUrl="Url of gamepley or images of the port"
                            onChange={
                                (inputs: ISource[]) => 
                                    onSourcesInputChanged(inputs, "sourcesUrl")
                            } 
                        />
                    </div>

                    <div className="mt-2">
                        <label className="block mb-1">Source Code</label>
                        <SourcesInputField 
                            ref={sourceCodeInputRef}
                            value={formData?.sourceCodeUrl}
                            onChange={
                                (inputs: ISource[]) => 
                                    onSourcesInputChanged(inputs, "sourceCodeUrl")
                            } 
                        />
                    </div>

                    <input 
                        type="text" 
                        name="tags" 
                        value={(formData.tags || []).join(",") || ""} 
                        onChange={handleChange} 
                        placeholder="Tags (comma separated)" 
                        className="w-full p-2 mb-3 mt-4 border rounded" 
                    />

                    {/* <div>
                        <label className="doom-btn-default p-3">
                            {   imageFile ?
                                    `File: ${imageFile.name}`
                                    :
                                    "Upload Image"
                            }
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleChange} 
                                className="hidden"
                            />
                        </label>
                        {   formData?.previewImg &&
                            <button 
                                className="doom-btn ml-4"
                                onClick={(e) => handleChange({ ...e, target: { files: [] }})}
                            >
                                <FaRegWindowClose size="27px" />
                            </button>
                        }
                    </div> */}

                    <label className="flex items-center mb-3 mt-4">
                        <input 
                            type="checkbox" 
                            name="isFirstLevelComplete" 
                            value={formData.isFirstLevelComplete ? "on" : "off"} 
                            onChange={handleChange} 
                            className="mr-2" 
                        />
                        First Level Complete
                    </label>

                    { uploadStatus.state === EProcessingState.error && 
                        <div className="doom-color-danger self-center">
                            {uploadStatus.message}
                        </div>
                    }

                    <button 
                        type="submit" 
                        className="
                            doom-action-btn 
                            p-2 w-1/2 h-10 mb-3
                            flex 
                            items-center justify-center self-center
                            gap-5"
                        disabled={isLoading()}
                    >
                        { isLoading() &&
                            <><LoadingIcon className="w-7 h-7" /> Uploading... </>
                        }
                        { !isLoading() &&
                            <p>Submit</p>
                        }
                    </button>
                </form>
            }
        </div>
    )
}
