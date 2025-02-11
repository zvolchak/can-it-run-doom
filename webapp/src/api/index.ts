import axios from "axios"
import { 
    IArchiveItem,
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


export async function fetchArchiveData({
    lang = "en",
}: IGetArchiveDataProps): Promise<IArchiveItem[] | null> {
    try {
        const url = `/db/${lang}/db.json`
        const response = await apiClient.get(url)
        return response?.data?.items
    } catch (error) {
        console.error("Failed to get archive data", error)
    }
} // getArchiveData


export async function refreshSession() {
    try {
        const url = "/user/login/refresh"
        // Session cookie should be in the apiClient request already - if previously
        // authenticated.
        await apiClient.post(url)
    } catch(error) {
        console.error("Failed to login!", error)
    }
} // refreshSession


export async function loginEmailAndPassword(email: string, password: string) {
    try {
        const url = "/user/login/email_and_password"
        // Session cookie will be set in the response on successfull authentication
        await apiClient.post(url, { email, password })
    } catch(error) {
        console.error("Failed to login!", error)
    }
} // loginEmailAndPassword
