import dotenv from "dotenv"
dotenv.config({ path: process.env.DOTENV_PATH || ".env" })
import { 
  collection, 
  getFirestore, 
  connectFirestoreEmulator,
} from "firebase/firestore"
import { initializeApp } from "firebase/app"


const isDev = process.env.NODE_ENV === "development" || true
const PORT = process.env.CANITRUNDOOM_API_PORT || "8081"
const projectId = process.env.FIREBASE_PROJECT_ID

const firebaseConfig = {
  projectId,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

if (isDev) {
    // Connect to Firestore Emulator
    connectFirestoreEmulator(db, "localhost", parseInt(PORT))
}

export const COLLECTION_NAME = {
  doomPorts: "doomPorts",
  authors: "authors",
}

export const doomPortsCollection = collection(db, COLLECTION_NAME.doomPorts)
export const authorsCollection = collection(db, COLLECTION_NAME.authors)

export { db }
