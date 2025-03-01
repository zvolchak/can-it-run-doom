export interface IRange {
    start: number
    end: number
}


export interface IFiltersStoreState {
    tags: string[]
    years: IRange | null
    availableYears?: number[] | null
    authors: string[]
    ids?: string[]
    searchString?: string | null
    page?: number | null
}


export function initFiltersStoreState(): IFiltersStoreState {
    return {
        tags: [],
        years: null,
        authors: [],
        ids: [],
        page: 1,
    }
}
