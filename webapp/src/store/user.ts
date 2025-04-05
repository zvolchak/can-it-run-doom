import { createSlice } from "@reduxjs/toolkit"
import { IUserData, IUserStoreState } from "@/src/types/UserType"


const initialState: IUserStoreState = {
    data: null,
}


function initDefaultUserData(): IUserData {
    return {
        id: "",
        email: "",
        isVerified: false,
        displayName: "",
        sessionId: "",
    }
}


const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserData: (state, action) => {
            state.data = action.payload
        },

        /* User's sessionId does not persist on tab close and is generated new on each
         * visit. This is needed for analytics to categorize A session, but to avoid any
         * links to a user between sessions.
         */
        setUserSessionId: (state, action) => {
            if (state.data === null)
                state.data = initDefaultUserData()

            state.data.sessionId = action.payload
        }
    }
})


export const { 
    setUserData, 
    setUserSessionId,
} = userSlice.actions


export default userSlice.reducer
