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
    publishDate?: string // date of the port published somewhere on the internet (source code or a video)
    tags?: string[]
    previewImgUrl?: string
    isPublished?: boolean

    createdAt?: Timestamp // when was this entry created
    updatedAt?: Timestamp
    submittedBy?: string
}


export interface ISubmissionsStoreState {
    items: IArchiveItem[]
}
