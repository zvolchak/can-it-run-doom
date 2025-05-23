import { 
    Timestamp,
    query, 
    where, 
    getDocs,
    addDoc,
    updateDoc,
    doc,
    setDoc,
    orderBy,
    documentId,
    limit as fbLimit,
    arrayUnion,
} from "firebase/firestore"
import { 
    authorsCollection,
    doomPortsCollection,
    doomPortsIncomingCollection,
    COLLECTION_NAME,
    fbDb,
    fbStorage,
} from "./firebaseApp"
import { IAuthorDocument, IArchiveItem, EItemStatus, } from "../@types"


export async function getAllEntries() {
    return await getDocs(query(doomPortsCollection, fbLimit(200)))
} // getAllEntries


// export async function getEntriesForReview({
//     limit = 200,
//     ids = []
// } = {}) {
//     const conditions: any[] = [ fbLimit(limit) ]
//     if (ids?.length > 0) {
//         conditions.push(where(documentId(), "in", ids))
//     }
//     const q = query(
//         doomPortsIncomingCollection,
//         ...conditions
//     )
//     return await getDocs(q)
// }


/* Get entries with a status == "published" to be displayed to users. 
* Use getAllEntries if need to get all unfiltered entries.
*/
export async function getEntriesByStatus({ 
    status = EItemStatus.published, 
    limit = 200,
    ids = []
} = {}) {
    const conditions = [
        where("status", "==", status),
        orderBy("updatedAt", "desc"),
        fbLimit(limit)  
    ]
    
    if (ids?.length > 0) {
        conditions.push(where(documentId(), "in", ids))
    }

    const collection = status !== EItemStatus.pending 
        ? doomPortsCollection : doomPortsIncomingCollection
    let q = query(
        collection,
        ...conditions
    )

    return await getDocs(q)
} // getEntriesByStatus


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


export function updateDoomPortQuery(id: string, entry: IArchiveItem) {
    const docRef = doc(fbDb, COLLECTION_NAME.doomPorts, id)
    const fields: any = { 
        ...entry,
        updatedAt: Timestamp.now(), // UTC timezone
    }
    if (entry.editHistory)
        fields.editHistory = arrayUnion(...entry.editHistory)

    return { docRef, fields }
} // updateDoomPortQuery


export async function updateDoomPort(id: string, entry: IArchiveItem) {
    const { docRef, fields } = updateDoomPortQuery(id, entry)
    return await updateDoc(docRef, fields)
} // updateDoomPort


export async function getAllDoomPorts() {
    return await getDocs(
        query(doomPortsCollection)
    )
} // getTags


/* 
 * Return a base64 image from firebase storage.
 * param imgPath: relative path to firbase storage root.
 */
export async function getImageFromStorage(imgPath: string): Promise<string | null>{
    try {
        const file = fbStorage.file(imgPath)
        const [exists] = await file.exists()
        if (!exists) {
            return null
        }

        const [buffer] = await file.download()
        const fileBase64 = `data:image/png;base64,${buffer.toString("base64")}`
        return fileBase64
    } catch {
        return null
    }
} // getImageFromStorage
