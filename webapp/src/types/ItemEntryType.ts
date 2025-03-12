export interface ISource {
    name: string
    url: string
}

export interface IArchiveItem {
    id: string
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


export interface ISubmissionsStoreState {
    items: IArchiveItem[]
    filtered: IArchiveItem[]
    totalSize: number
}
