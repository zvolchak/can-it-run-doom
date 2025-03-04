export enum UserRole {
    Owner = "owner",
    
    // A logged in user who can add and edit entries.
    User = "user",

    // Same access level as User, plus can approve new entries.
    Moderator = "moderator",
}


export const UserAccessPriority = [
    UserRole.Owner, 
    UserRole.Moderator,
    UserRole.User, 
]


export function IsAuthorized(incoming: UserRole, target: UserRole) {
    if (!incoming || !target)
        return false
    
    const incomingIndex = UserAccessPriority.indexOf(incoming)
    const targetIndex = UserAccessPriority.indexOf(target)

    if (incomingIndex < 0 || targetIndex < 0)
        return false

    return incomingIndex <= targetIndex
} // IsAuthorized
