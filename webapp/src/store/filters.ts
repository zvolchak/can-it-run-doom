import { createSlice } from "@reduxjs/toolkit"
import { IFiltersStoreState, initFiltersStoreState } from "@/src/types"


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
        setAppliedTags: (state, action) => reducers.setTags(state, action),
        setAppliedYears: (state, action) => reducers.setYears(state, action),
        setAppliedAuthors: (state, action) => reducers.setAuthors(state, action),
    }
})


export const { 
    setAvailableTags,
    setAvailableYears,
    setAvailableAuthors,
} = availableFiltersSlice.actions


export const { 
    setAppliedTags,
    setAppliedYears,
    setAppliedAuthors,
} = appliedFiltersSlice.actions

