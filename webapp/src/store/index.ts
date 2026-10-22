import { combineReducers, configureStore } from "@reduxjs/toolkit"
import submissionsReducer from "./submissions"
import userReducer from "./user"
import settingsReducer from "./settings"
import { availableFiltersSlice, appliedFiltersSlice } from "./filters"
import type { IFiltersStoreState } from "../types/FiltersType"

export * from "./submissions"
export * from "./user"
export * from "./filters"
export * from "./settings"

const reducer = combineReducers({
    submissions: submissionsReducer,
    user: userReducer,
    settings: settingsReducer,
    availableFilters: availableFiltersSlice.reducer,
    appliedFilters: appliedFiltersSlice.reducer,
})

export type RootState = ReturnType<typeof reducer>

/** One store per SSR request and one per mounted browser app. */
export function createAppStore(initialFilters?: IFiltersStoreState) {
    return configureStore({
        reducer,
        preloadedState: initialFilters ? { ...reducer(undefined, { type: "@@init" }), appliedFilters: initialFilters } : undefined,
    })
}

export type AppStore = ReturnType<typeof createAppStore>
