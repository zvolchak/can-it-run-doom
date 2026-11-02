import { useEffect, useMemo, useState, useRef, } from "react"
import { useSelector, useDispatch, } from "react-redux"
import {
    addNewEntry,
    fetchTags,
} from "@/src/api"
import {
    InputWithLabel,
    LoadingIcon,
    SourcesInputField,
    SearchableDropdown,
    ImageUploaderInput,
} from "@/src/components"
import { IArchiveItem, ISource, ITag, IUploadStatus, EProcessingState, } from "@/src/types"
import { RootState, setNewEntryForm, setUplaodStatus, } from "@/src/store"
import { AddedEntrySuccessView } from "./ResponseViews/AddedEntrySuccessView"


const todayLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
const withScheme = (url: string) => (/^[a-z][a-z\d+.-]*:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`)
const isValidUrl = (url: string) => {
    try {
        const parsed = new URL(withScheme(url))
        return ["http:", "https:"].includes(parsed.protocol) && parsed.hostname.includes(".")
    } catch {
        return false
    }
}
const withUrlSchemes = (sources: ISource[]) => sources.map(source => ({ ...source, url: withScheme(source.url) }))


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
    const [tagVocabulary, setTagVocabulary] = useState<ITag[] | null>(null)
    useEffect(() => { fetchTags().then(setTagVocabulary) }, [])
    const tagOptions = useMemo(() => (tagVocabulary || []).map(tag => ({
        value: tag.id,
        label: tag.label,
        group: tag.category.charAt(0).toUpperCase() + tag.category.slice(1),
        description: tag.description,
    })), [tagVocabulary])
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formKey, setFormKey] = useState(0)
    const formRef = useRef<HTMLFormElement | null>(null)
    const authorInputRef = useRef<{ getAllInputs: () => string[][] } | null>(null)
    const sourcesInputRef = useRef<{ getAllInputs: () => string[][] } | null>(null)
    const sourceCodeInputRef = useRef<{ getAllInputs: () => string[][] } | null>(null)


    function clearError(key: string) {
        setErrors(current => {
            if (!current[key]) return current
            const { [key]: _removed, ...rest } = current
            return rest
        })
    } // clearError


    function handleChange(e) {
        const { name, value, type, checked, files } = e.target
        clearError(name)
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
            nextState.previewImg = files[0] ? URL.createObjectURL(files[0]) : null
        }
        
        dispatch(setNewEntryForm(nextState))
        onChange?.(nextState)
    } // handleChange


    function onTagsChanged(tags: string[]) {
        clearError("tags")
        const nextState = { ...formData, tags }
        dispatch(setNewEntryForm(nextState))
        onChange?.(nextState)
    } // onTagsChanged


    function onSourcesInputChanged(inputs: ISource[], key: string) {
        clearError(key)
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


    function validate(inputs: ReturnType<typeof getInputs>): Record<string, string> {
        const found: Record<string, string> = {}
        if (!formData.title?.trim())
            found.title = "Enter a title."
        if (!formData.publishDate)
            found.publishDate = "Enter the date the port was published."
        else if (formData.publishDate > todayLocal())
            found.publishDate = "The publish date can't be in the future."
        if (!inputs.authors.length)
            found.authors = "Add at least one author with a name and a link."
        else if (inputs.authors.some(author => !isValidUrl(author.url)))
            found.authors = "Author links must be valid URLs."
        if (inputs.sourcesUrl.some(source => !isValidUrl(source.url)))
            found.sourcesUrl = "Media links must be valid URLs."
        if (inputs.sourceCodeUrl.some(source => !isValidUrl(source.url)))
            found.sourceCodeUrl = "Source code links must be valid URLs."
        if (tagVocabulary && !(formData.tags || []).filter(Boolean).length)
            found.tags = "Pick at least one tag so people can find this entry."
        return found
    } // validate


    function clearForm() {
        dispatch(setNewEntryForm(null))
        dispatch(setUplaodStatus({ state: EProcessingState.none, message: null }))
        setImageFile(null)
        setErrors({})
        setFormKey(key => key + 1)
        onChange?.(null)
    } // clearForm


    async function handleSubmit(e) {
        e.preventDefault()
        const inputs = getInputs()
        const found = validate(inputs)
        setErrors(found)
        if (Object.keys(found).length) {
            setTimeout(() => formRef.current?.querySelector("[data-invalid='true']")
                ?.scrollIntoView({ block: "center", behavior: "smooth" }), 0)
            return
        }

        const loadingTimeStart = performance.now()
        const nextState = {
            ...formData,
            title: formData.title.trim(),
            tags: (formData.tags || []).filter(Boolean),
            authors: withUrlSchemes(inputs.authors),
            sourcesUrl: withUrlSchemes(inputs.sourcesUrl),
            sourceCodeUrl: withUrlSchemes(inputs.sourceCodeUrl),
        }
        dispatch(setNewEntryForm(nextState))
        dispatch(setUplaodStatus({ state: EProcessingState.uploading }))

        const formDataToSend = new FormData()
        formDataToSend.append("items", JSON.stringify([nextState]))
        if (imageFile) {
            formDataToSend.append("image", imageFile)
        }
        
        // doom_ports/add endpoint expects a list of items in the body.
        const response = await addNewEntry(formDataToSend)
        setEntryResponse(response?.data)

        if (response?.status >= 400 || response?.error) {
            const message = "Failed to add an entry! Please, contact support if error persists."
            dispatch(setUplaodStatus({ 
                state: EProcessingState.error, 
                message: response.data.error || message
            })) 
        } else {
            // Show a loading spinner for at least 1 second, so that screen doesn't change
            // states too fast.
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
                text-foreground
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
                    ref={formRef}
                    key={formKey}
                    onSubmit={handleSubmit} 
                    noValidate
                    className="entry-form"
                >
                    <h2 className="title text-center">Add New Entry</h2>
                    <p className="entry-form__intro">
                        Fields marked * are required. The preview card shows how your entry will look.
                    </p>

                    <fieldset className="entry-form__section">
                        <legend>The project</legend>

                        <div data-invalid={!!errors.title}>
                            <InputWithLabel 
                                required 
                                title="Title *"
                                value={formData.title} 
                                onChange={handleChange} 
                                placeholder="Doom on a toaster"
                                error={errors.title}
                            />
                        </div>

                        <div>
                            <label className="entry-form__label" htmlFor="entry-description">Description</label>
                            <textarea 
                                id="entry-description"
                                name="description" 
                                value={formData.description || ""} 
                                onChange={handleChange} 
                                placeholder="What is it, and what makes this port interesting?" 
                                className="w-full" 
                                rows={4}
                            />
                        </div>

                        <div data-invalid={!!errors.publishDate}>
                            <InputWithLabel 
                                required 
                                title="Publish Date *"
                                value={formData.publishDate} 
                                type="date"
                                onChange={handleChange} 
                                placeholder="YYYY-MM-DD"
                                className="sm:w-1/2" 
                                error={errors.publishDate}
                            />
                        </div>

                        <label className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                name="isFirstLevelComplete" 
                                checked={!!formData.isFirstLevelComplete} 
                                onChange={handleChange} 
                            />
                            First level is completable
                        </label>
                    </fieldset>

                    <fieldset className="entry-form__section" data-invalid={!!errors.authors}>
                        <legend>Credit *</legend>
                        <p className="entry-form__hint">Link to the profile of each author on Reddit, YouTube, GitHub, etc.</p>
                        <SourcesInputField 
                            ref={authorInputRef}
                            value={formData?.authors}
                            requiredName={true}
                            requiredUrl={true}
                            addLabel="Add another author"
                            placeholderUrl="Author's profile at Reddit, YouTube, Github, etc"
                            onChange={
                                (inputs: ISource[]) => 
                                    onSourcesInputChanged(inputs, "authors")
                            } 
                        />
                        {errors.authors && <p role="alert" className="entry-form__error">{errors.authors}</p>}
                    </fieldset>

                    <fieldset className="entry-form__section">
                        <legend>Links and media</legend>

                        <div data-invalid={!!errors.sourcesUrl}>
                            <label className="entry-form__label">Gameplay or screenshots</label>
                            <SourcesInputField
                                ref={sourcesInputRef}
                                value={formData?.sourcesUrl}
                                placeholderUrl="Link to a video or images of the port"
                                addLabel="Add another link"
                                onChange={
                                    (inputs: ISource[]) => 
                                        onSourcesInputChanged(inputs, "sourcesUrl")
                                } 
                            />
                            {errors.sourcesUrl && <p role="alert" className="entry-form__error">{errors.sourcesUrl}</p>}
                        </div>

                        <div data-invalid={!!errors.sourceCodeUrl}>
                            <label className="entry-form__label">Source code</label>
                            <SourcesInputField 
                                ref={sourceCodeInputRef}
                                value={formData?.sourceCodeUrl}
                                addLabel="Add another repository"
                                onChange={
                                    (inputs: ISource[]) => 
                                        onSourcesInputChanged(inputs, "sourceCodeUrl")
                                } 
                            />
                            {errors.sourceCodeUrl && <p role="alert" className="entry-form__error">{errors.sourceCodeUrl}</p>}
                        </div>

                        <ImageUploaderInput 
                            onImageSelect={handleChange}
                        />
                    </fieldset>

                    <fieldset className="entry-form__section" data-invalid={!!errors.tags}>
                        <legend>Tags *</legend>
                        <p className="entry-form__hint">Pick everything that applies: the device, system, and techniques involved.</p>
                        <SearchableDropdown
                            options={tagOptions}
                            value={(formData.tags || []).filter(Boolean)}
                            onChange={onTagsChanged}
                            placeholder="Select tags"
                            searchPlaceholder="Search tags"
                            emptyMessage={tagVocabulary ? "No matching tags." : "Tags could not be loaded. Reload the page to try again."}
                        />
                        {errors.tags && <p role="alert" className="entry-form__error">{errors.tags}</p>}
                    </fieldset>

                    { uploadStatus.state === EProcessingState.error && 
                        <div role="alert" className="text-danger self-center">
                            {uploadStatus.message}
                        </div>
                    }

                    <div className="entry-form__actions">
                        <button 
                            type="button" 
                            className="doom-btn-secondary p-2 h-10 px-4"
                            disabled={isLoading()}
                            onClick={clearForm}
                        >
                            Clear form
                        </button>
                        <button 
                            type="submit" 
                            className="
                                doom-action-btn 
                                p-2 h-10 px-8
                                flex 
                                items-center justify-center
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
                    </div>
                </form>
            }
        </div>
    )
}
