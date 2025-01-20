import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    items: [],
    selectedItem: null
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
