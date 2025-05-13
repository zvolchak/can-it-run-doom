export interface IUserAuth {
    id: string
    accessToken: string
    email?: string
    sessionExpiresOn?: Date
    isVerified?: boolean
    displayName?: string
    role?: string
}

export interface IUserAuthResponse {
    message: string
    user: IUserAuth | null
    status_code?: number
}
