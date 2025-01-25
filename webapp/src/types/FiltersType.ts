export interface IRange {
    start: number
    end: number
}


export interface IFiltersStoreState {
    tags: string[]
    years: number[] | null
    authors: string[]
}


export function initFiltersStoreState(): IFiltersStoreState {
    return {
        tags: [],
        years: null,
        authors: [],
    }
}
