// Dumps Firestore collections to local JSON files using the production service account.
// Read-only. Usage (from api/):
//   node migrations/backupCollections.cjs [outDir] [collection ...]
const admin = require("firebase-admin")
const { mkdirSync, writeFileSync } = require("fs")
const { join } = require("path")

const DEFAULT_COLLECTIONS = ["doomPorts", "doomPorts-Incoming", "authors"]
const [outDir = join(__dirname, "../../backups", new Date().toISOString().slice(0, 10)), ...names] =
    process.argv.slice(2)
const collections = names.length ? names : DEFAULT_COLLECTIONS

admin.initializeApp({
    credential: admin.credential.cert(require("../credentials-production.json")),
})
const db = admin.firestore()

async function main() {
    mkdirSync(outDir, { recursive: true })
    for (const name of collections) {
        const snapshot = await db.collection(name).get()
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        writeFileSync(join(outDir, `${name}.json`), JSON.stringify(docs, null, 2))
        console.log(`${name}: ${docs.length} documents`)
    }
    console.log(`Written to ${outDir}`)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
