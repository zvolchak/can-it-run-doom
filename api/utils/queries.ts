import { Timestamp, FieldValue, FieldPath } from "firebase-admin/firestore"
import { 
    authorsCollection,
    doomPortsCollection,
    doomPortsIncomingCollection,
    tagsCollection,
    fbDb,
    fbStorage,
} from "./firebaseApp"
import { publicationFields } from "./publication"
import { IAuthorDocument, IArchiveItem, EItemStatus, } from "../@types"


export async function getAllEntries() {
    return await doomPortsCollection.limit(200).get()
} // getAllEntries


/* Get entries with a status == "published" to be displayed to users. 
* Use getAllEntries if need to get all unfiltered entries.
*/
export async function getEntriesByStatus({ 
    status = EItemStatus.published, 
    limit = 200,
    ids = []
} = {}) {
    const collection = status !== EItemStatus.pending 
        ? doomPortsCollection : doomPortsIncomingCollection
    let q = collection.where("status", "==", status).orderBy("updatedAt", "desc")

    if (ids?.length > 0) {
        q = q.where(FieldPath.documentId(), "in", ids)
    }

    return await q.limit(limit).get()
} // getEntriesByStatus


export async function getAuthorsByName(name: string) { 
    return await authorsCollection
        .where("name_lowerCase", "==", name.toLocaleLowerCase())
        .get()
} // getAuthorsByName


export async function getAllAuthors() {
    return await authorsCollection.get()
} // getTags


export async function getAllTags() {
    return await tagsCollection.get()
} // getAllTags


const KNOWN_TAGS_TTL_MS = 60 * 1000
let knownTags: { ids: Set<string>, loadedAt: number } | null = null

/** Ids of the curated tags, cached briefly so submissions don't re-read the collection each time. */
export async function getKnownTagIds(): Promise<Set<string>> {
    if (knownTags && Date.now() - knownTags.loadedAt < KNOWN_TAGS_TTL_MS) return knownTags.ids
    const snapshot = await getAllTags()
    knownTags = { ids: new Set(snapshot.docs.map(doc => doc.id)), loadedAt: Date.now() }
    return knownTags.ids
} // getKnownTagIds


export async function addAuthor(author: IAuthorDocument) {
    return await authorsCollection.add(
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
    return await authorsCollection.doc(id).update(
        { 
            ...entry,
            updatedAt: Timestamp.now(), // UTC timezone
        }
    )
} // updateAuthor


/** Every public writer reads persisted dates inside the same transaction. */
export async function addDoomPort(newEntry: IArchiveItem) {
    const ref = newEntry.id ? doomPortsCollection.doc(newEntry.id) : doomPortsCollection.doc()
    await fbDb.runTransaction(async transaction => {
        const snapshot = await transaction.get(ref)
        transaction.set(ref, publicationFields(newEntry, snapshot.exists ? snapshot.data() : null, Timestamp.now()))
    })
    return ref
}

export async function updateDoomPort(id: string, entry: IArchiveItem) {
    const ref = doomPortsCollection.doc(id)
    return fbDb.runTransaction(async transaction => {
        const snapshot = await transaction.get(ref)
        if (!snapshot.exists) throw new Error("Entry not found")
        const previous = snapshot.data()
        const fields = publicationFields({ ...previous, ...entry }, previous, Timestamp.now())
        if (entry.editHistory) fields.editHistory = FieldValue.arrayUnion(...entry.editHistory) as any
        transaction.update(ref, fields)
    })
}

/** Opt-in cursor path includes records missing updatedAt. Document IDs give a
 * stable unique order and startAfter does not require the prior document to exist. */
export async function getPublishedEntriesPage(pageSize: number, cursor?: string) {
    let q = doomPortsCollection
        .where("status", "==", EItemStatus.published).orderBy(FieldPath.documentId())
    if (cursor) q = q.startAfter(cursor)
    return q.limit(pageSize + 1).get()
}


export async function getAllDoomPorts() {
    return await doomPortsCollection.get()
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
