export interface IUserStoreState {
    data: IUserData | null
}


export interface IUserData {
    id?: string
    email?: string
    displayName?: string
    isVerified?: boolean
    sessionId?: string
    sessionExpiresOn?: Date,
}
