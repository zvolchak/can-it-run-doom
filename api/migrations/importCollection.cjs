// Upserts a JSON array into a Firestore collection, one document per item, keyed by item.id.
// Dry run unless --apply is passed. Documents are replaced whole, so fields removed from the
// file disappear from Firestore. { _seconds, _nanoseconds } objects from backupCollections.cjs become Timestamps. Documents missing from the file are kept unless --prune is passed.
//
// Usage (from api/):
//   node migrations/importCollection.cjs <file.json> <collection> --env local|development|production [--apply] [--prune]
// --env local targets the Firestore emulator (firebase emulators:start --only firestore) and needs no
// credentials. development and production use the cloud projects, unless FIRESTORE_EMULATOR_HOST is set.
const admin = require("firebase-admin")
const { readFileSync } = require("fs")
const { resolve } = require("path")
const { isDeepStrictEqual } = require("util")

const BATCH_SIZE = 400
const LOCAL_EMULATOR_HOST = "localhost:8081"
const LOCAL_PROJECT_ID = "can-it-run-doom-dev"
const PREVIEW_LIMIT = 15

function fail(message) {
    console.error(message)
    process.exit(1)
}

function parseArgs(argv) {
    const positional = []
    const options = { apply: false, prune: false, env: undefined }
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i]
        if (arg === "--apply") options.apply = true
        else if (arg === "--prune") options.prune = true
        else if (arg === "--env") options.env = argv[++i]
        else if (arg.startsWith("--")) fail(`Unknown option ${arg}`)
        else positional.push(arg)
    }
    const [file, collection] = positional
    if (!file || !collection || positional.length > 2) fail("Usage: importCollection.cjs <file.json> <collection> --env local|development|production [--apply] [--prune]")
    if (!["local", "development", "production"].includes(options.env)) fail("--env local|development|production is required")
    return { file, collection, ...options }
}

/** backupCollections.cjs dumps Timestamps as { _seconds, _nanoseconds }; turn exactly that shape back into Timestamps. */
function reviveTimestamps(value) {
    if (Array.isArray(value)) return value.map(reviveTimestamps)
    if (value && typeof value === "object") {
        const keys = Object.keys(value)
        if (keys.length === 2 && typeof value._seconds === "number" && typeof value._nanoseconds === "number") {
            return new admin.firestore.Timestamp(value._seconds, value._nanoseconds)
        }
        return Object.fromEntries(keys.map((key) => [key, reviveTimestamps(value[key])]))
    }
    return value
}

function loadItems(file) {
    const items = JSON.parse(readFileSync(resolve(file), "utf8"))
    if (!Array.isArray(items)) fail(`${file} must contain a JSON array`)
    const seen = new Set()
    items.forEach((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) fail(`Item ${index} is not an object`)
        const { id } = item
        if (typeof id !== "string" || !id.trim()) fail(`Item ${index} has no string id`)
        if (id.includes("/") || id === "." || id === ".." || /^__.*__$/.test(id)) fail(`Item ${index} has an id Firestore cannot use as a document id: ${id}`)
        if (seen.has(id)) fail(`Duplicate id ${id}`)
        seen.add(id)
    })
    return items
}

function preview(label, ids) {
    if (!ids.length) return
    const shown = ids.slice(0, PREVIEW_LIMIT).join(", ")
    console.log(`  ${label}: ${shown}${ids.length > PREVIEW_LIMIT ? `, ... (+${ids.length - PREVIEW_LIMIT})` : ""}`)
}

async function main() {
    const { file, collection, env, apply, prune } = parseArgs(process.argv.slice(2))
    const items = loadItems(file)

    let projectId = LOCAL_PROJECT_ID
    if (env === "local") {
        process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || LOCAL_EMULATOR_HOST
        admin.initializeApp({ projectId })
    } else {
        const credentials = require(`../credentials-${env}.json`)
        projectId = credentials.project_id
        admin.initializeApp({ credential: admin.credential.cert(credentials) })
    }
    const db = admin.firestore()
    const target = process.env.FIRESTORE_EMULATOR_HOST
        ? `emulator ${process.env.FIRESTORE_EMULATOR_HOST} (project ${projectId})`
        : `project ${projectId}`
    console.log(`${apply ? "APPLY" : "Dry run"}: ${items.length} items from ${file} -> ${collection} (${target})`)

    const existing = new Map()
    const snapshot = await db.collection(collection).get()
    snapshot.forEach((doc) => existing.set(doc.id, doc.data()))

    const created = []
    const updated = []
    const unchanged = []
    const writes = []
    for (const { id, ...rawData } of items) {
        const data = reviveTimestamps(rawData)
        if (!existing.has(id)) created.push(id)
        else if (!isDeepStrictEqual(existing.get(id), data)) updated.push(id)
        else {
            unchanged.push(id)
            continue
        }
        writes.push({ type: "set", ref: db.collection(collection).doc(id), data })
    }
    const fileIds = new Set(items.map((item) => item.id))
    const stale = [...existing.keys()].filter((id) => !fileIds.has(id))
    if (prune) stale.forEach((id) => writes.push({ type: "delete", ref: db.collection(collection).doc(id) }))

    console.log(`create ${created.length}, update ${updated.length}, unchanged ${unchanged.length}, ${prune ? "delete" : "not in file (kept)"} ${stale.length}`)
    preview("create", created)
    preview("update", updated)
    preview(prune ? "delete" : "kept", stale)

    if (!apply) return console.log("Dry run only. Re-run with --apply to write.")
    if (!writes.length) return console.log("Nothing to write.")

    for (let i = 0; i < writes.length; i += BATCH_SIZE) {
        const batch = db.batch()
        for (const write of writes.slice(i, i + BATCH_SIZE)) {
            if (write.type === "set") batch.set(write.ref, write.data)
            else batch.delete(write.ref)
        }
        await batch.commit()
    }
    console.log(`Wrote ${writes.length} changes.`)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
