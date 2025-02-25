import { useState, useRef, } from "react"
import { FaRegWindowClose } from "react-icons/fa"
import {
    addNewEntry,
} from "@/src/api"
import {
    InputWithLabel,
    SourcesInputField,
} from "@/src/components"

interface IAddEntryViewProps {
    className?: string
}


export function AddEntryView({ className = "", }: IAddEntryViewProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        authors: [],
        sourcesUrl: [],
        sourceCodeUrl: [],
        isFirstLevelComplete: false,
        publishDate: "",
        tags: "",
        previewImg: ""
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const authorInputRef = useRef<{ getAllInputs: () => string[][] } | null>(null)
    const sourcesInputRef = useRef<{ getAllInputs: () => string[][] } | null>(null)
    const sourceCodeInputRef = useRef<{ getAllInputs: () => string[][] } | null>(null)


    function handleChange(e) {
        const { name, value, type, checked } = e.target
        setFormData(prevState => ({
            ...prevState,
            [name]: type === "checkbox" ? checked : value
        }))
    } // handleChange


    function handleImageChange(e) {
        if (e.target.files.length > 0) {
            setImageFile(e.target.files[0])
        }
    } // handleImageChange


    function onSourcesInputChanged(inputs: string[][], key: string) {
        if (!formData[key])
            formData[key] = []

        formData[key] = inputs
    } // onSourcesInputChanged


    function getInputs(e) {
        const formElement = e.target
        const formDataObject = new FormData(formElement)
        const inputsData = Object.fromEntries(formDataObject.entries())
        inputsData.authors = (authorInputRef.current.getAllInputs() as any) || []
        inputsData.sourcesUrl = (sourcesInputRef.current.getAllInputs() as any) || []
        inputsData.sourceCodeUrl = (sourceCodeInputRef.current.getAllInputs() as any) || []

        return inputsData
    } // getInputs


    async function handleSubmit(e) {
        setIsLoading(true)
        e.preventDefault()
        const newFormData = getInputs(e)

        setFormData((prev) => ({
            ...prev,
            ...newFormData
        }))

        let isFirstLevelComplete = false
        if (formData.isFirstLevelComplete.toString() === "on")
            isFirstLevelComplete = true

        try {
            const formDataToSend = new FormData()
            formDataToSend.append("title", formData.title)
            formDataToSend.append("description", formData.description)
            formDataToSend.append("authors", JSON.stringify(formData.authors))
            formDataToSend.append("sourcesUrl", JSON.stringify(formData.sourcesUrl))
            formDataToSend.append("sourceCodeUrl", JSON.stringify(formData.sourceCodeUrl))
            formDataToSend.append("isFirstLevelComplete", isFirstLevelComplete.toString())
            formDataToSend.append("publishDate", formData.publishDate)
            formDataToSend.append("tags", formData.tags)
            if (imageFile) {
                formDataToSend.append("image", imageFile)
            }

            await addNewEntry(formDataToSend)
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            console.error("Failed to add entry:", error)
        }
    } // handleSubmit


    return (
        <div
            className={`
                doom-color-secondary
                doom-card p-6 w-full
                ${className}
            `}
        >
            { isLoading &&
                <div>
                    Uploading ...
                </div>
            }
            { !isLoading &&
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
                            value={formData?.authors || [["", ""]]}
                            requiredName={true}
                            requiredUrl={true}
                            placeholderUrl="Author's profile at Reddit, YouTube, Github, etc"
                            onChange={
                                (inputs: string[][]) => 
                                    onSourcesInputChanged(inputs, "authors")
                            } 
                        />
                    </div>

                    <div className="mt-2">
                        <label className="block mb-1">Media Source</label>
                        <SourcesInputField
                            ref={sourcesInputRef}
                            value={formData?.sourcesUrl || [["", ""]]}
                            placeholderUrl="Url of gamepley or images of the port"
                            onChange={
                                (inputs: string[][]) => 
                                    onSourcesInputChanged(inputs, "sourcesUrl")
                            } 
                        />
                    </div>

                    <div className="mt-2">
                        <label className="block mb-1">Source Code</label>
                        <SourcesInputField 
                            ref={sourceCodeInputRef}
                            value={formData?.sourceCodeUrl || [["", ""]]}
                            onChange={
                                (inputs: string[][]) => 
                                    onSourcesInputChanged(inputs, "sourceCodeUrl")
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
                            placeholder="Title" 
                            className="w-full" 
                        />
                    </div>

                    <input 
                        type="text" 
                        name="tags" 
                        value={formData.tags} 
                        onChange={handleChange} 
                        placeholder="Tags (comma separated)" 
                        className="w-full p-2 mb-3 border rounded" 
                    />

                    <div>
                        <label className="doom-btn-default p-3">
                            {   !imageFile ?
                                    "Upload Image"
                                    :
                                    `File: ${imageFile.name}`
                            }
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                className="hidden"
                            />
                        </label>
                        {   imageFile &&
                            <button 
                                className="doom-btn ml-4"
                                onClick={() => setImageFile(null)}
                            >
                                <FaRegWindowClose size="27px" />
                            </button>
                        }
                    </div>

                    <label className="flex items-center mb-3 mt-4">
                        <input 
                            type="checkbox" 
                            name="isFirstLevelComplete" 
                            checked={formData.isFirstLevelComplete} 
                            onChange={handleChange} 
                            className="mr-2" 
                        />
                        First Level Complete
                    </label>

                    <button 
                        type="submit" 
                        className="doom-action-btn"
                    >
                        Submit
                    </button>
                </form>
            }
        </div>
    )
}
