import { createSlice } from "@reduxjs/toolkit"
import { ISubmissionsStoreState } from "@/src/types"

const initialState: ISubmissionsStoreState = {
    items: [],
    filtered: [],
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
    }
})

export const { 
    setItems,
    setFiltered,
} = submissionsSlice.actions


export default submissionsSlice.reducer
