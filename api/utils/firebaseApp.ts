import dotenv from "dotenv"
dotenv.config({ path: process.env.DOTENV_PATH || ".env" })

import { Request, Response, NextFunction, } from "express"
import { 
  collection, 
  getFirestore, 
  connectFirestoreEmulator,
} from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { DecodedIdToken } from "firebase-admin/auth"
import { initializeApp } from "firebase/app"
import * as admin from "firebase-admin"
import { readFileSync } from "fs"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

const isDev = process.env.NODE_ENV === "development" || true

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  appId: process.env.FIREBASE_APP_ID,
}

if (isDev) {
    const filePath = join(__dirname, "../credentials.json")
    const credentials = JSON.parse(readFileSync(filePath, "utf8"))
    admin.initializeApp({
        credential: admin.credential.cert(credentials),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    })
} else {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    })
}


const fbApp = initializeApp(firebaseConfig)
const fbDb = getFirestore(fbApp)
const fbAuth = getAuth(fbApp)
const fbStorage = admin.storage().bucket()

const fbAuthAdmin = admin.auth()

if (isDev) {
    connectFirestoreEmulator(fbDb, "localhost", 8081)
}

export const COLLECTION_NAME = {
  doomPorts: "doomPorts",
  authors: "authors",
}

export const doomPortsCollection = collection(fbDb, COLLECTION_NAME.doomPorts)
export const authorsCollection = collection(fbDb, COLLECTION_NAME.authors)


/* Create an oAuth session token and add it to a response cookie. */
export async function createSessionToken(res: Response, token: string) {
    const expiresIn = 60 * 60 * 24 * 14 * 1000
    const sessionCookie = await fbAuthAdmin.createSessionCookie(token, { expiresIn })

    res.cookie("session", sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: expiresIn,
    })

    return sessionCookie
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


export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const sessionCookie = req.cookies.session || null
    if (!sessionCookie) {
        return res.status(401).json({ error: "Unauthorized: No session cookie found" })
    }

    try {
        const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true)
        req.user = decodedClaims
        next()
    } catch (error) {
        console.error("Session cookie verification failed:", error)
        return res.status(401).json({ error: "Unauthorized: Invalid or expired session cookie" })
    }
} // authenticate


export function generateFirestoreId() {
    const timestamp = Date.now().toString(36)
    const randomPart = uuidv4().replace(/-/g, "").substring(0, 10)
    return timestamp + randomPart
}


export { fbApp, fbAuth, fbDb, fbAuthAdmin, fbStorage, }
