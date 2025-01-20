import { configureStore } from "@reduxjs/toolkit"
import submissionsReducer from "./submissions"
import userReducer from "./user"

export * from "./submissions"
export * from "./user"


export const store = configureStore({
    reducer: {
        submissions: submissionsReducer,
        user: userReducer,
    }
})


export type RootState = ReturnType<typeof store.getState>
