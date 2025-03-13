import { createSlice } from "@reduxjs/toolkit"
import { ISettingsStoreState } from "@/src/types"

const initialState: ISettingsStoreState = {
    isFiltersMenu: false,
}

const settingsSlice = createSlice({
    name: "submissions",
    initialState,
    reducers: {
        setIsFiltersMenu: (state, action) => {
            state.isFiltersMenu = action.payload
        },
    }
})

export const { 
    setIsFiltersMenu, 
} = settingsSlice.actions


export default settingsSlice.reducer
