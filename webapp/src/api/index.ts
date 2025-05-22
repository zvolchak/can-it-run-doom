import axios from "axios"
import Cookies from "js-cookie"
import { 
    IArchiveItem,
    IUserAuthResponse,
    IUserAuth,
} from "@/src/types"
import {
    IsSessionExpired,
} from "@/src/utils"


const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
    // headers: {
    //     "Content-Type": "application/json",
    //     "Accept": "application/json",
    // },
})


apiClient.interceptors.response.use(response => response, async error => {
        const urlIgnoreRegex = /^\/user\/(login|signup)(\/.*)?$/
        const originalRequest = error.config

        // Skip retry for login-related requests
        if (urlIgnoreRegex.test(originalRequest.url || "")) {
            return Promise.reject(error)
        }

        // Handle 401 by refreshing token and retrying request
        if (error.response?.status === 401) {
            return axios(originalRequest)
        }

        return Promise.reject(error)
    }
) // apiClient.use


// interface IGetArchiveDataProps {
//     page?: number
//     perPage?: number
//     ids?: string[]
// }

// interface IFetchPortsResponse {
//     items: IArchiveItem[]
//     totalSize?: number
// }

export async function fetchDoomPorts({ status = "published" } = {}): 
    Promise<IArchiveItem[] | null> 
{
    const query = `?status=${status}`

    try {
        const url = `/doom_ports${query}`
        const response = await apiClient.get(url)
        return response?.data?.items || []
    } catch {
        return []
    }
} // getArchiveData


export async function validateSession(): Promise<IUserAuthResponse> {
    // const url = "/user/login/validate"
    const user = JSON.parse(Cookies.get("user") || null) as IUserAuth
    if (user && !IsSessionExpired())
        return { message: "", user }

    return { message: "", user: null }
    // try {
    //     const response = await apiClient.post(url)
    //     return response.data
    // } catch {
    //     return { message: "Failed to validate session", user: null }
    // }
}


export async function signOut(): Promise<boolean> {
    const url = "/user/signout"
    try {
        await apiClient.post(url)
        localStorage.removeItem("sessionExpiresOn")

        return true
    } catch {
        return false
    }
} // signOut


export async function loginWithEmailAndPassword(email: string, password: string): 
    Promise<IUserAuthResponse> 
{
    const url = "/user/login/email_and_password"
    try {
        // Session cookie will be set in the response on successfull authentication
        const response = await apiClient.post(url, { email, password })

        if (response.data?.user?.sessionExpiresOn) {
            localStorage.setItem("sessionExpiresOn", response.data.user.sessionExpiresOn)
        }

        return response.data
    } catch (error) {
        let message = "Login failed"
        if (error.response?.status === 401)
            message = "Incorrect email or password."

        return {
            user: null,
            message,
            status_code: error?.response?.status || 500
          }
    }
} // loginEmailAndPassword


export async function signupWithEmailAndPassword({displayName, email, password }): 
    Promise<IUserAuthResponse> 
{
    const url = "/user/signup/email_and_password"
    try {
        const response = await apiClient.post(url, { displayName, email, password })
        return response.data
    } catch (error) {
        return {
            user: null,
            message: error?.response?.data?.error || "Failed to signup",
            status_code: error?.response?.status || 500
        }
    }
} // signupWithEmailAndPassword


export async function addNewEntry(formData) {
    const url = "/doom_ports/add"
    // const headers = {
    //     "Content-Type": "multipart/form-data"
    // }
    try {
        const response = await apiClient.post(url, formData, { headers: { "Content-Type": undefined } })
        if (response?.status >= 400)
            throw new Error("Failed to add new entry")

        return response
    } catch (error) {
        return error.response
    }
} // addNewEntry


export async function reviewEntry({ ids, status }) {
    const body = {
        ids,
        status
    }
    try {
        const url = `/doom_ports/review`
        const response = await apiClient.post(url, body)
        return response?.data?.items || []
    } catch (error) {
        console.error(error)
        return []
    }
} // reviewEntry
