import { 
    Timestamp,
    query, 
    where, 
    getDocs,
    addDoc,
    updateDoc,
    doc,
    orderBy,
    documentId,
    limit as fbLimit,
    arrayUnion,
    runTransaction,
    startAfter,
} from "firebase/firestore"
import { 
    authorsCollection,
    doomPortsCollection,
    doomPortsIncomingCollection,
    COLLECTION_NAME,
    fbDb,
    fbStorage,
} from "./firebaseApp"
import { publicationFields } from "./publication"
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
    const q = query(
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


/** Every public writer reads persisted dates inside the same transaction. */
export async function addDoomPort(newEntry: IArchiveItem) {
    const ref = newEntry.id ? doc(doomPortsCollection, newEntry.id) : doc(doomPortsCollection)
    await runTransaction(fbDb, async transaction => {
        const snapshot = await transaction.get(ref)
        transaction.set(ref, publicationFields(newEntry, snapshot.exists() ? snapshot.data() : null, Timestamp.now()))
    })
    return ref
}

export async function updateDoomPort(id: string, entry: IArchiveItem) {
    const ref = doc(doomPortsCollection, id)
    return runTransaction(fbDb, async transaction => {
        const snapshot = await transaction.get(ref)
        if (!snapshot.exists()) throw new Error("Entry not found")
        const previous = snapshot.data()
        const fields = publicationFields({ ...previous, ...entry }, previous, Timestamp.now())
        if (entry.editHistory) fields.editHistory = arrayUnion(...entry.editHistory) as any
        transaction.update(ref, fields)
    })
}

/** Opt-in cursor path includes records missing updatedAt. Document IDs give a
 * stable unique order and startAfter does not require the prior document to exist. */
export async function getPublishedEntriesPage(pageSize: number, cursor?: string) {
    return getDocs(query(doomPortsCollection,
        where("status", "==", EItemStatus.published), orderBy(documentId()),
        ...(cursor ? [startAfter(cursor)] : []), fbLimit(pageSize + 1)))
}


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
