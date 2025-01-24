import { createSlice } from "@reduxjs/toolkit"
import { ISubmissionsStoreState } from "@/src/types"

const initialState: ISubmissionsStoreState = {
    items: [],
    allTags: [],
}

const submissionsSlice = createSlice({
    name: "submissions",
    initialState,
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload
        },

        setAllTags: (state, action) => {
            state.allTags = action.payload
        }
    }
})

export const { 
    setItems, 
    setAllTags,
} = submissionsSlice.actions


export default submissionsSlice.reducer
