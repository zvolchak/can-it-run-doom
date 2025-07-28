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
    publishDate: string
    tags: string[]
    previewImg: string
}


export interface IUploadStatus {
    state: EProcessingState
    message: string | null
}


export interface IItemCollection {
    [key: string]: IArchiveItem[]
}


export interface ISubmissionsStoreState {
    items: IArchiveItem[]
    selected: IArchiveItem
    filtered: IArchiveItem[]
    totalSize: number
    newEntryForm: IArchiveItem
    uploadStatus: IUploadStatus
    collections: IItemCollection | null
}
