import { 
    Timestamp,
    query, 
    where, 
    getDocs,
    addDoc,
    updateDoc,
    doc,
} from "firebase/firestore"
import { 
    authorsCollection,
    doomPortsCollection,
    COLLECTION_NAME,
    db,
} from "./db"
import { IAuthorDocument, IArchiveItem, } from "../types"


export async function getAuthorsByName(name: string) { 
    return await getDocs(query(
        authorsCollection, 
        where("name_lowerCase", "==", name.toLocaleLowerCase())
    ))
} // getAuthorsByName


export async function getAllAuthors() {
    return await getDocs(
        query(authorsCollection)
    )
} // getTags


export async function addAuthor(author: IAuthorDocument) {
    return await addDoc(
        authorsCollection, 
        { 
            isDeleted: false,
            ...author, 
            name_lowerCase: author.name.toLocaleLowerCase(),
            createdAt: Timestamp.now(), // UTC timezone
            updatedAt: Timestamp.now(), // UTC timezone
        }
    )
} // addAuthor


export async function updateAuthor(id: string, entry: IAuthorDocument) {
    const docRef = doc(db, COLLECTION_NAME.authors, id)
    return await updateDoc(
        docRef, 
        { 
            ...entry,
            updatedAt: Timestamp.now(), // UTC timezone
        }
    )
} // updateAuthor


export async function addDoomPort(newEntry: IArchiveItem) {
    return await addDoc(
        doomPortsCollection, 
        { 
            ...newEntry,
            createdAt: Timestamp.now(), // UTC timezone
            updatedAt: Timestamp.now(), // UTC timezone
        }
    )
} // addDoomPort


export async function updateDoomPort(id: string, entry: IArchiveItem) {
    const docRef = doc(db, COLLECTION_NAME.doomPorts, id)
    return await updateDoc(
        docRef, 
        { 
            ...entry,
            updatedAt: Timestamp.now(), // UTC timezone
        }
    )
} // updateDoomPort


export async function getAllDoomPorts() {
    return await getDocs(
        query(doomPortsCollection)
    )
} // getTags
