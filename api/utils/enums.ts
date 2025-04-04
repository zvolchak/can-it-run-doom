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


export function IsAuthorized(incoming: EUserRole, target: EUserRole) {
    if (!incoming || !target)
        return false
    
    const incomingIndex = UserAccessPriority.indexOf(incoming)
    const targetIndex = UserAccessPriority.indexOf(target)

    if (incomingIndex < 0 || targetIndex < 0)
        return false

    return incomingIndex <= targetIndex
} // IsAuthorized
