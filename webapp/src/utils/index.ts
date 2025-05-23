import Cookies from "js-cookie"
import {
    EUserRole,
    IUserAuth,
    UserAccessPriority,
} from "@/src/types"
export * from "./itemsFilters"


export function IsProd() {
    return ["production", "prod"].indexOf(process.env.NODE_ENV.toLocaleLowerCase()) >= 0
}


export function isUseComma(items: Array<any>, index: number) {
    return items?.length > 1 && index < items?.length - 1
}


export const paginate = (target: Array<any>, currentPage: number, itemsPerPage: number): any => {
    const result = [ ...target ]
    if (currentPage < 0 ) currentPage = 0
  
    const start = (itemsPerPage * currentPage)
    return result.splice(start, itemsPerPage)
  } // paginate
  

export function getValueFromQuery(query, targetKey: string) {
    if (!query || !query[targetKey])
        return []

    return decodeURIComponent(query[targetKey] as string || "").split(",")
            .filter(q => q || q !== "")
} // getValueFromQuery


export function IsSessionExpired() {
    const user = JSON.parse(Cookies.get("user") || null) as IUserAuth
    if (!user)
        return true

    const expirationTime = new Date(user.sessionExpiresOn).getTime()
    const currentTime = Date.now()

    return currentTime >= expirationTime
} // isPastSessionDate


export function IsAuthorized(incoming: EUserRole, target: EUserRole) {
    if (!incoming || !target)
        return false
    
    const incomingIndex = UserAccessPriority.indexOf(incoming)
    const targetIndex = UserAccessPriority.indexOf(target)

    if (incomingIndex < 0 || targetIndex < 0)
        return false

    return incomingIndex <= targetIndex
} // IsAuthorized


export async function validateImageFile(
    file: File, 
    options = { 
        maxSizeMB: 0.3, 
        maxWidth: 400, 
        maxHeight: 400,
         allowedFormats: ["image/jpeg", "image/png", "image/jpg"] 
    }
): Promise<{ valid: boolean, message?: string }> {
    const fileSize = file.size / 1024 / 1024
    // Size check
    if (fileSize > options.maxSizeMB) {
        return { 
            valid: false, 
            message: `Image size should be less than ${options.maxSizeMB}MB. ` +
                `Got ${fileSize.toPrecision(2)}MB.` 
        }
    }

    // Format check
    if (!options.allowedFormats.includes(file.type)) {
        return { 
            valid: false, 
            message: `Invalid file format "${file.type}". ` + 
                `Allowed formats are: ${options.allowedFormats.join(", ")}.` 
        };
    }

    // Dimension check
    const img = document.createElement('img')
    const objectUrl = URL.createObjectURL(file)
    return new Promise<{ valid: boolean, message?: string }>((resolve) => {
        img.onload = function () {
            if (img.width > options.maxWidth || img.height > options.maxHeight) {
                resolve({ 
                    valid: false, 
                    message: "Image dimensions should be at most " + 
                        `${options.maxWidth}x${options.maxHeight}px.` +
                        ` Got ${img.width}x${img.height}px.`
                })
            } else {
                resolve({ valid: true })
            }
            URL.revokeObjectURL(objectUrl)
        }
        img.onerror = function () {
            resolve({ valid: false, message: "Invalid image file." })
            URL.revokeObjectURL(objectUrl)
        }
        img.src = objectUrl
    })
} // validateImageFile
