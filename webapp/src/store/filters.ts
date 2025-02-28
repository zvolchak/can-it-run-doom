import { createSlice } from "@reduxjs/toolkit"
import { IFiltersStoreState, initFiltersStoreState } from "@/src/types"
import { RootState } from "@/src/store"

const initialState: IFiltersStoreState = initFiltersStoreState()


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
        setAvailableYears: (state, action) => reducers.setYears(state, action),
        setAvailableAuthors: (state, action) => reducers.setAuthors(state, action),
    }
})


// FIXME: this probably not needed, since applied tags are coming from url query
export const appliedFiltersSlice = createSlice({
    name: "appliedFilters",
    initialState,
    reducers: {
        setAppliedTags: (state, action) => {
            reducers.setTags(state, action)
            reducers.setAuthors(state, { ...action, payload: []})
        },
        
        setAppliedAuthors: (state, action) => {
            reducers.setAuthors(state, action)
            reducers.setTags(state, { ...action, payload: []})
        },

        setAppliedYears: (state, action) => reducers.setYears(state, action),

        setAppliedSearch: (state, action) => {
            state.searchString = action.payload
        },

        setAppliedId: (state, action) => {
            state.ids = action.payload
            reducers.setTags(state, { ...action, payload: []})
            reducers.setTags(state, { ...action, payload: []})
        },

        setAppliedPage: (state, action) => {
            state.page = action.payload
        },
    }
})


export const isFilterApplied = (state: RootState) => {
    return state.appliedFilters.authors?.length > 0 ||
            state.appliedFilters.tags?.length > 0 ||
            state.appliedFilters.years?.start !== null || 
            state.appliedFilters.years?.end !== null || 
            state.appliedFilters.searchString?.length > 0 ||
            state.appliedFilters.ids?.length > 0
}


export const { 
    setAvailableTags,
    setAvailableYears,
    setAvailableAuthors,
} = availableFiltersSlice.actions


export const { 
    setAppliedTags,
    setAppliedYears,
    setAppliedAuthors,
    setAppliedSearch,
    setAppliedId,
    setAppliedPage,
} = appliedFiltersSlice.actions

