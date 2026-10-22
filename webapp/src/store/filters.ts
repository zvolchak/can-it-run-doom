import { createSlice } from "@reduxjs/toolkit"
import { initFiltersStoreState, type IFiltersStoreState } from "../types/FiltersType"
import type { RootState } from "./index"
import { activeArchiveFilters } from "../utils/archiveResults"

const initialState: IFiltersStoreState = initFiltersStoreState()

function resetPageIfChanged(state, previous, next) {
    if (JSON.stringify(previous) !== JSON.stringify(next)) state.page = 1
}


const reducers = {
    setTags: (state, action) => {
        state.tags = action.payload
    },

    setYears: (state, action) => {
        state.years = action.payload
    },

    setAuthors: (state, action) => {
        state.authors = action.payload
    },
}


export const availableFiltersSlice = createSlice({
    name: "availableFilters",
    initialState,
    reducers: {
        setAvailableTags: (state, action) => reducers.setTags(state, action),
        
        setAvailableYears: (state, action) => {
            state.availableYears = action.payload
        },
        
        setAvailableAuthors: (state, action) => reducers.setAuthors(state, action),
    }
})


// FIXME: this probably not needed, since applied tags are coming from url query
export const appliedFiltersSlice = createSlice({
    name: "appliedFilters",
    initialState,
    reducers: {
        // URL hydration must preserve the requested page; user edits reset it.
        setAppliedFilters: (state, action) => ({ ...state, ...action.payload }),
        clearAppliedFilters: (state) => ({ ...initFiltersStoreState(), query: { sort: state.query?.sort } }),
        toggleAppliedTag: (state, action) => {
            state.tags = state.tags.includes(action.payload)
                ? state.tags.filter(tag => tag !== action.payload)
                : [...state.tags, action.payload]
            if (!state.tags.length) state.tagMatch = "all"
            state.page = 1
        },
        applyArchiveFilters: (state, action) => {
            const next = { ...action.payload, page: state.page }
            resetPageIfChanged(next, { ...state, page: 1 }, { ...next, page: 1 })
            return next
        },
        setAppliedTags: (state, action) => {
            resetPageIfChanged(state, state.tags, action.payload || [])
            reducers.setTags(state, action || [])
            if (!state.tags.length) state.tagMatch = "all"
        },
        
        setAppliedAuthors: (state, action) => {
            resetPageIfChanged(state, state.authors, action.payload || [])
            reducers.setAuthors(state, action || [])
        },

        setAppliedYears: (state, action) => {
            resetPageIfChanged(state, state.years, action.payload)
            reducers.setYears(state, action)
        },

        setAppliedSearch: (state, action) => {
            resetPageIfChanged(state, state.searchString || "", action.payload || "")
            state.searchString = action.payload || ""
        },

        setAppliedId: (state, action) => {
            resetPageIfChanged(state, state.ids, action.payload || [])
            state.ids = action.payload || []
        },

        setAppliedPage: (state, action) => {
            state.page = action.payload || 1
        },

        setQuery: (state, action) => {
            resetPageIfChanged(state, state.query, action.payload)
            state.query = action.payload
        },
    }
})


export const isFilterApplied = (state: RootState) => {
    return activeArchiveFilters(state.appliedFilters).length > 0
}


export const { 
    setAvailableTags,
    setAvailableYears,
    setAvailableAuthors,
} = availableFiltersSlice.actions


export const { 
    toggleAppliedTag,
    applyArchiveFilters,
    setAppliedFilters,
    clearAppliedFilters,
    setAppliedTags,
    setAppliedYears,
    setAppliedAuthors,
    setAppliedSearch,
    setAppliedId,
    setAppliedPage,
    setQuery,
} = appliedFiltersSlice.actions

