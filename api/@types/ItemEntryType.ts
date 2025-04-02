import { Timestamp } from "firebase/firestore"

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
    requestUrl?: string

    createdAt?: Timestamp // when was this entry created
    updatedAt?: Timestamp
    submittedBy?: string
}


export interface ISubmissionsStoreState {
    items: IArchiveItem[]
}
