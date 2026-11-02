// Updates selected fields of existing Firestore documents from a reviewed JSON file, in place,
// and appends documents that Firestore does not have yet (created whole, never overwriting).
// Other fields of existing documents, including timestamps, are never touched, and updatedAt is not bumped.
// A field is only written if Firestore still holds the value from the backup the new file was
// made from, so edits made since the backup are never overwritten. Dry run unless --apply is passed.
//
// Usage (from api/):
//   node migrations/updateFields.cjs <backup.json> <updated.json> <collection> --env local|development|production [--fields tags,title,description] [--update-only] [--apply]
// <backup.json> is the dump the updated file was derived from (what Firestore held when it was taken).
const admin = require("firebase-admin")
const { readFileSync } = require("fs")
const { resolve } = require("path")
const { isDeepStrictEqual } = require("util")

const BATCH_SIZE = 400
const LOCAL_EMULATOR_HOST = "localhost:8081"
const LOCAL_PROJECT_ID = "can-it-run-doom-dev"
const DEFAULT_FIELDS = ["tags", "title", "description"]
const PREVIEW_LIMIT = 10
const USAGE = "Usage: updateFields.cjs <backup.json> <updated.json> <collection> --env local|development|production [--fields a,b,c] [--update-only] [--apply]"

function fail(message) {
    console.error(message)
    process.exit(1)
}

function parseArgs(argv) {
    const positional = []
    const options = { apply: false, updateOnly: false, env: undefined, fields: DEFAULT_FIELDS }
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i]
        if (arg === "--apply") options.apply = true
        else if (arg === "--update-only") options.updateOnly = true
        else if (arg === "--env") options.env = argv[++i]
        else if (arg === "--fields") options.fields = (argv[++i] || "").split(",").map((f) => f.trim()).filter(Boolean)
        else if (arg.startsWith("--")) fail(`Unknown option ${arg}`)
        else positional.push(arg)
    }
    const [backupFile, updatedFile, collection] = positional
    if (!backupFile || !updatedFile || !collection || positional.length > 3) fail(USAGE)
    if (!["local", "development", "production"].includes(options.env)) fail("--env local|development|production is required")
    if (!options.fields.length || options.fields.includes("id")) fail("--fields needs at least one field and cannot include id")
    return { backupFile, updatedFile, collection, ...options }
}

function loadDocs(file) {
    const docs = JSON.parse(readFileSync(resolve(file), "utf8"))
    if (!Array.isArray(docs)) fail(`${file} must contain a JSON array`)
    const byId = new Map()
    for (const doc of docs) {
        if (typeof doc?.id !== "string" || !doc.id) fail(`${file} has a document without a string id`)
        if (byId.has(doc.id)) fail(`${file} has duplicate id ${doc.id}`)
        byId.set(doc.id, doc)
    }
    return byId
}

// Dumps store Timestamps as { _seconds, _nanoseconds }; appended documents need real Timestamps.
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

function preview(label, items) {
    if (!items.length) return
    const shown = items.slice(0, PREVIEW_LIMIT).join(", ")
    console.log(`  ${label}: ${shown}${items.length > PREVIEW_LIMIT ? `, ... (+${items.length - PREVIEW_LIMIT})` : ""}`)
}

async function main() {
    const { backupFile, updatedFile, collection, env, fields, updateOnly, apply } = parseArgs(process.argv.slice(2))
    const backup = loadDocs(backupFile)
    const updated = loadDocs(updatedFile)

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
    console.log(`${apply ? "APPLY" : "Dry run"}: fields [${fields.join(", ")}] from ${updatedFile} -> ${collection} (${target})`)

    const current = new Map()
    const snapshot = await db.collection(collection).get()
    snapshot.forEach((doc) => current.set(doc.id, doc.data()))

    const writes = []
    const appends = []
    const counts = { documents: 0, fields: 0, unchanged: 0, alreadyApplied: 0 }
    const notInBackup = []
    const conflicts = []
    for (const [id, next] of updated) {
        const live = current.get(id)
        if (!live) {
            const { id: _id, ...data } = next
            appends.push({ ref: db.collection(collection).doc(id), data: reviveTimestamps(data) })
            continue
        }
        const before = backup.get(id)
        if (!before) {
            notInBackup.push(id)
            continue
        }
        const changed = fields.filter((field) => !isDeepStrictEqual(next[field], before[field]))
        if (!changed.length) {
            counts.unchanged++
            continue
        }
        const patch = {}
        for (const field of changed) {
            if (isDeepStrictEqual(live[field], next[field])) counts.alreadyApplied++
            else if (!isDeepStrictEqual(live[field], before[field])) conflicts.push(`${id}.${field}`)
            else patch[field] = next[field]
        }
        if (Object.keys(patch).length) {
            counts.documents++
            counts.fields += Object.keys(patch).length
            writes.push({ ref: db.collection(collection).doc(id), patch })
        }
    }

    if (updateOnly) appends.length = 0
    console.log(`update ${counts.fields} fields in ${counts.documents} documents; append ${appends.length} new documents; no change needed ${counts.unchanged}; already applied ${counts.alreadyApplied}`)
    console.log(`skipped: changed in Firestore since the backup ${conflicts.length}, exists in Firestore but not in backup ${notInBackup.length}`)
    preview("changed since backup", conflicts)
    preview("exists but not in backup", notInBackup)
    preview("will update", writes.map((w) => `${w.ref.id}[${Object.keys(w.patch).join("+")}]`))
    preview("will append", appends.map((a) => a.ref.id))

    if (!apply) return console.log("Dry run only. Re-run with --apply to write.")
    if (!writes.length && !appends.length) return console.log("Nothing to write.")

    const ops = [...writes.map((w) => ({ ...w, kind: "update" })), ...appends.map((a) => ({ ...a, kind: "create" }))]
    for (let i = 0; i < ops.length; i += BATCH_SIZE) {
        const batch = db.batch()
        for (const op of ops.slice(i, i + BATCH_SIZE)) {
            if (op.kind === "update") batch.update(op.ref, op.patch)
            else batch.create(op.ref, op.data)
        }
        await batch.commit()
    }
    console.log(`Updated ${counts.documents} documents, appended ${appends.length}.`)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
