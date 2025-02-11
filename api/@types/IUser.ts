export interface IUserAuth {
    id: string
    accessToken: string
    email?: string
    isVerified?: boolean
}

export interface IUserAuthResponse {
    message: string
    user: null
}
