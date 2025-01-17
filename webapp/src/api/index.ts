import axios from "axios"
import { IArchiveItem } from "@/src/types"


const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
})


interface IGetArchiveDataProps {
    lang?: string
    page?: number
    limit?: number
}


export async function fetchArchiveData({
    lang = "en",
    page = 0,
    limit = 500,
}: IGetArchiveDataProps): Promise<IArchiveItem | null> {
    try {
        const url = `/db/${lang}/db.json`
        const response = await apiClient.get(url)
        return response?.data?.items
    } catch (error) {
        console.error("Failed to get archive data", error)
    }
} // getArchiveData
