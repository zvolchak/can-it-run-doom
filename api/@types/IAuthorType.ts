import { Timestamp } from "firebase-admin/firestore"
import { ISource } from "./ItemEntryType"

export interface IAuthorDocument {
    name?: string
    links?: ISource[]
    name_lowerCase?: string // for lower cased quering
    createdAt?: Timestamp
    updatedAt?: Timestamp
    isDeleted?: boolean
}
