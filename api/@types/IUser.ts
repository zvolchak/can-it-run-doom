import { EUserRole } from "@/utils"


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


export interface ISetUserRoleBody {
    uid: string
    role: EUserRole
}
