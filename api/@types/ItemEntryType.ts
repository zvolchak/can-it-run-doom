import { DocumentReference, Timestamp, WriteBatch } from "firebase/firestore"

export interface ISource {
    name: string
    url: string
}

export interface IArchiveItem {
    id?: string
    title?: string
    description?: string
    authors?: ISource[]
    sourcesUrl?: ISource[]
    sourceCodeUrl?: ISource[]
    isFirstLevelComplete?: boolean
    // date of the port published somewhere on the internet (source code or a video)
    tags?: string[]
    publishDate?: string | Timestamp 
    previewImg?: string
    isPublished?: boolean
    createdBy?: string
    updatedBy?: string[]
    // A url to a submitted request to be reviewed. Right now, it is a Github Issues link.
    requestUrl?: string | null

    createdAt?: Timestamp // when was this entry created
    updatedAt?: Timestamp
    submittedBy?: string
}


export interface ISubmissionsStoreState {
    items: IArchiveItem[]
}


export interface IEntryBatch {
    batch: WriteBatch
    id: string
    entry: IArchiveItem
    docRef: DocumentReference<IArchiveItem>
    file: any // FIXME: use the right file type
}

export interface IEntryAddedResponse {
    success: IEntryBatch[]
    failed: IArchiveItem[]
}
