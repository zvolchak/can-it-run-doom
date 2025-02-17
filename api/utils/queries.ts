import { 
    Timestamp,
    query, 
    where, 
    getDocs,
    addDoc,
    updateDoc,
    doc,
    setDoc,
} from "firebase/firestore"
import { 
    authorsCollection,
    doomPortsCollection,
    COLLECTION_NAME,
    fbDb,
} from "./firebaseApp"
import { IAuthorDocument, IArchiveItem, } from "../@types"


export async function getAllEntries() {
    return await getDocs(query(doomPortsCollection))
} // getAllEntries


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
    const docRef = doc(fbDb, COLLECTION_NAME.authors, id)
    return await updateDoc(
        docRef, 
        { 
            ...entry,
            updatedAt: Timestamp.now(), // UTC timezone
        }
    )
} // updateAuthor


export async function addDoomPort(newEntry: IArchiveItem) {
    const data = { 
        ...newEntry,
        createdAt: Timestamp.now(), // UTC timezone
        updatedAt: Timestamp.now(), // UTC timezone
    }
    // delete ID from explicitly adding it to the document, sinc doc id itself serves its purpose
    delete data["id"]

    if (!newEntry.id)
        return await addDoc(doomPortsCollection, data)
    else {
        // add document using custom ID value to support legacy entry identification
        const itemRef = doc(doomPortsCollection, newEntry.id)
        return await setDoc(itemRef, data)
    }
} // addDoomPort


export async function updateDoomPort(id: string, entry: IArchiveItem) {
    const docRef = doc(fbDb, COLLECTION_NAME.doomPorts, id)
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
