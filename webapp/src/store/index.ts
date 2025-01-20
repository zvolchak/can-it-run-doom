import { configureStore } from "@reduxjs/toolkit"
import submissionsReducer from "./submissions"

export * from "./submissions"


export const store = configureStore({
    reducer: {
        submissions: submissionsReducer,
    }
})


export type RootState = ReturnType<typeof store.getState>
