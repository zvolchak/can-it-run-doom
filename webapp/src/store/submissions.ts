import { createSlice } from "@reduxjs/toolkit"
import { ISubmissionsStoreState } from "@/src/types"

const initialState: ISubmissionsStoreState = {
    items: [],
    filtered: [],
    totalSize: 0,
}

const submissionsSlice = createSlice({
    name: "submissions",
    initialState,
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload
        },

        setFiltered: (state, action) => {
            state.filtered = action.payload
        },

        setTotalSize: (state, action) => {
            state.totalSize = action.payload
        },
    }
})

export const { 
    setItems,
    setFiltered,
    setTotalSize,
} = submissionsSlice.actions


export default submissionsSlice.reducer
