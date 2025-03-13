import dotenv from "dotenv"
dotenv.config({ path: process.env.DOTENV_PATH || ".env" })

import { Response, } from "express"
import { 
  collection, 
  getFirestore, 
  connectFirestoreEmulator,
} from "firebase/firestore"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { DecodedIdToken } from "firebase-admin/auth"
import { initializeApp } from "firebase/app"
import * as admin from "firebase-admin"
import { readFileSync } from "fs"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

/* To use Auth and Storage on the Emulator, don't forget to export these vars before running
 * the server:
 * export FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
 * export FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
 */

const isDev = process.env.NODE_ENV === "development"

console.debug(`Environment: ${process.env.NODE_ENV}`)
export const SESSION_COOKIE_LIFESPAN = 60 * 60 * 24 * 14 * 1000

const firebaseConfig = {
    projectId: process.env.FB_PROJECT_ID,
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    appId: process.env.FB_APP_ID,
}

if (isDev) {
    const filePath = join(__dirname, `../credentials-${process.env.NODE_ENV}.json`)
    const credentials = JSON.parse(readFileSync(filePath, "utf8"))
    admin.initializeApp({
        credential: admin.credential.cert(credentials),
        storageBucket: process.env.FB_STORAGE_BUCKET
    })
} else {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.FB_STORAGE_BUCKET,
    })
}


const fbApp = initializeApp(firebaseConfig)
const fbDb = getFirestore(fbApp)
const fbAuth = getAuth(fbApp)
const fbStorage = admin.storage().bucket()
const fbAuthAdmin = admin.auth()

if (isDev) {
    connectFirestoreEmulator(fbDb, "localhost", 8081)
    connectAuthEmulator(fbAuth, "http://127.0.0.1:9099")
}

export const COLLECTION_NAME = {
  doomPorts: "doomPorts",
  authors: "authors",
}

export const doomPortsCollection = collection(fbDb, COLLECTION_NAME.doomPorts)
export const authorsCollection = collection(fbDb, COLLECTION_NAME.authors)


/* Create an oAuth session token and add it to a response cookie. */
export async function createSessionToken(res: Response, token: string) {
    const expiresIn = SESSION_COOKIE_LIFESPAN
    const sessionCookie = await fbAuthAdmin.createSessionCookie(token, { expiresIn })

    res.cookie("session", sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: expiresIn,
    })

    const expiresOn = new Date(Date.now() + expiresIn)
    return { sessionCookie, expiresOn }
} // createSessionToken


export async function clearSessionToken(res: Response) {
    res.clearCookie("session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    })
    return res
} // clearSessionToken


export async function verifySessionCookie(session: string): Promise<DecodedIdToken> {
    if (!session) {
        return null
    }
    try {
        const claims = await fbAuthAdmin.verifySessionCookie(session, true)
        return claims
    } catch (error) {
      console.error("Failed to verify session cookie!", error)
      return null
    }
} // verifySessionCookie


export async function verifyToken(token: string) {
    try {
        const decodedToken = await fbAuthAdmin.verifyIdToken(token)
        return decodedToken
      } catch (error) {
        console.error("Failed to verify token.", error)
        return null
      }
} // verifyToken


export async function createToken(uid: string, claims: object = {}) {
    try {
        const customToken = await admin.auth().createCustomToken(uid, claims)
        return customToken
      } catch (error) {
        console.error("Error creating token:", error)
        return null
      }
} // verifyToken


export function generateFirestoreId() {
    const timestamp = Date.now().toString(36)
    const randomPart = uuidv4().replace(/-/g, "").substring(0, 10)
    return timestamp + randomPart
}


export { fbApp, fbAuth, fbDb, fbAuthAdmin, fbStorage, }
