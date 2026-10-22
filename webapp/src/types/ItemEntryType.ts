export enum EProcessingState {
    none = null,
    success = "success",
    error = "error",
    uploading = "uploading",
}


export interface ISource {
    name: string
    url: string
}


export interface IArchiveItem {
    id?: string
    title: string
    description: string
    authors: ISource[]
    sourcesUrl: ISource[]
    sourceCodeUrl: ISource[]
    isFirstLevelComplete: boolean
    addedAt?: string | null // ISO UTC first-publication instant
    createdAt?: string | null // ISO UTC legacy fallback for archive recency
    publishDate: string
    tags: string[]
    previewImg: string
}


export interface IUploadStatus {
    state: EProcessingState
    message: string | null
}


export interface ISubmissionsStoreState {
    items: IArchiveItem[]
    selected: IArchiveItem
    filtered: IArchiveItem[]
    totalSize: number
    newEntryForm: IArchiveItem
    uploadStatus: IUploadStatus
}
