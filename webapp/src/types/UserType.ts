export enum EUserRole {
    Owner = "owner",
    
    // A logged in user who can add and edit entries.
    User = "user",

    // Same access level as User, plus can approve new entries.
    Moderator = "moderator",
}


export const UserAccessPriority = [
    EUserRole.Owner, 
    EUserRole.Moderator,
    EUserRole.User, 
]


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
    role?: EUserRole,
}
