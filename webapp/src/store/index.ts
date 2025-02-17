import { configureStore } from "@reduxjs/toolkit"
import submissionsReducer from "./submissions"
import userReducer from "./user"
import settingsReducer from "./settings"
import { availableFiltersSlice, appliedFiltersSlice } from "./filters"

export * from "./submissions"
export * from "./user"
export * from "./filters"
export * from "./settings"

export const store = configureStore({
    reducer: {
        submissions: submissionsReducer,
        user: userReducer,
        settings: settingsReducer,
        availableFilters: availableFiltersSlice.reducer,
        appliedFilters: appliedFiltersSlice.reducer,
    }
})


export type RootState = ReturnType<typeof store.getState>
