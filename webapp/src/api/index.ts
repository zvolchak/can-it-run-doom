import axios from "axios"
import { 
    IArchiveItem,
    IUserAuthResponse,
} from "@/src/types"


const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
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


interface IGetArchiveDataProps {
    lang?: string
    page?: number
    limit?: number
}


export async function fetchDoomPorts({
    lang = "en",
}: IGetArchiveDataProps): Promise<IArchiveItem[] | null> {
    try {
        const url = "/doom_ports"
        const response = await apiClient.get(url)
        return response?.data
    } catch (error) {
        console.error("Failed to get archive data", error)
        return []
    }
} // getArchiveData


export async function refreshSession() {
    const url = "/user/login/refresh"
    // Session cookie should be in the apiClient request already - if previously
    // authenticated.
    await apiClient.post(url)
} // refreshSession


export async function validateSession(): Promise<IUserAuthResponse> {
    const url = "/user/login/validate"
    try {
        const response = await apiClient.post(url)
        return response.data
    } catch {
        return { message: "Failed to validate session", user: null }
    }
}


export async function signOut(): Promise<boolean> {
    const url = "/user/signout"
    try {
        await apiClient.post(url)
        return true
    } catch(error) {
        console.error("Failed to sign out", error)
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
        return response.data
    } catch (error) {
        console.error(error)
    }
} // loginEmailAndPassword
