import { createSlice } from "@reduxjs/toolkit"
import { ISubmissionsStoreState, EProcessingState } from "@/src/types"


const initialState: ISubmissionsStoreState = {
    items: [],
    filtered: [],
    totalSize: 0,
    /* Tracks the status of uploading a new entry. Helps to act on different types of 
     * states by different components when an Entry is uploading to show a Loading screen,
     * or to display the right Success or Error screen when the http request is completed. 
    */
    uploadStatus: { state: EProcessingState.none, message: null },

    newEntryForm: {
        title: "",
        description: "",
        authors: [],
        sourcesUrl: [],
        sourceCodeUrl: [],
        isFirstLevelComplete: false,
        publishDate: null,
        tags: [],
        previewImg: ""
    }
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

        setNewEntryForm: (state, action) => {
            state.newEntryForm = !action.payload ? initialState.newEntryForm : action.payload
        },

        setUplaodStatus: (state, action) => {
            state.uploadStatus = { ...state.uploadStatus, ...action.payload }
        },
    }
})

export const { 
    setItems,
    setFiltered,
    setTotalSize,
    setNewEntryForm,
    setUplaodStatus,
} = submissionsSlice.actions


export default submissionsSlice.reducer
