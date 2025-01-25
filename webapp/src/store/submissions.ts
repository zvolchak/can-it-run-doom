import { createSlice } from "@reduxjs/toolkit"
import { ISubmissionsStoreState } from "@/src/types"

const initialState: ISubmissionsStoreState = {
    items: [],
}

const submissionsSlice = createSlice({
    name: "submissions",
    initialState,
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload
        },
    }
})

export const { 
    setItems, 
} = submissionsSlice.actions


export default submissionsSlice.reducer
