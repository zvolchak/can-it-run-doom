export interface IRange {
    start: number
    end: number
}


export enum SortOption {
    added = "added",
    latest = "latest",
    oldest = "oldest",
}


export interface IFilterQuery {
    levelCompleted?: boolean | string
    hasCode?: boolean | string
    authorsPerItem?: number | string
    limit?: number | string
    sort?: SortOption
}


export interface IFiltersStoreState {
    tagMatch?: "all" | "any"
    tags: string[]
    years: IRange | null
    availableYears?: number[] | null
    authors: string[]
    ids?: string[]
    searchString?: string | null
    page?: number | null
    query?: IFilterQuery
}


export function initFiltersStoreState(): IFiltersStoreState {
    return {
        tagMatch: "all",
        tags: [],
        years: null,
        authors: [],
        ids: [],
        page: 1,
        query: {},
    }
}
