export interface IUserAuth {
    id: string
    email?: string
    isVerified?: boolean
    sessionExpiresOn?: Date
}

export interface IUserAuthResponse {
    message: string
    user: IUserAuth
}
