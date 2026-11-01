// Applies a reviewed list of field edits to a Firestore dump (JSON array of documents).
// Each edit: { id, field, from, to, skip? }. An edit applies only if the document's current value
// still equals `from`, so a stale review never overwrites newer text. Edits with "skip": true are ignored.
//
// Usage: node migrations/applyEdits.cjs <data.json> <edits.json> <out.json>
const { readFileSync, writeFileSync } = require("fs")
const { resolve } = require("path")

const [dataFile, editsFile, outFile] = process.argv.slice(2)
if (!dataFile || !editsFile || !outFile) {
    console.error("Usage: applyEdits.cjs <data.json> <edits.json> <out.json>")
    process.exit(1)
}
if (resolve(outFile) === resolve(dataFile)) {
    console.error("Refusing to overwrite the input file; write to a new path.")
    process.exit(1)
}

const docs = JSON.parse(readFileSync(dataFile, "utf8"))
const edits = JSON.parse(readFileSync(editsFile, "utf8"))
const byId = new Map(docs.map((doc) => [doc.id, doc]))

let applied = 0
let skipped = 0
const problems = []
for (const edit of edits) {
    if (edit.skip) {
        skipped++
        continue
    }
    const doc = byId.get(edit.id)
    if (!doc) problems.push(`${edit.id}: no such document`)
    else if ((doc[edit.field] || "") !== (edit.from || "")) problems.push(`${edit.id}.${edit.field}: current value differs from "from"`)
    else {
        doc[edit.field] = edit.to
        applied++
    }
}

if (problems.length) {
    console.error(`${problems.length} edits could not be applied; nothing written:\n  ${problems.join("\n  ")}`)
    process.exit(1)
}
writeFileSync(outFile, JSON.stringify(docs, null, 2))
console.log(`Applied ${applied} edits, skipped ${skipped}. Wrote ${outFile}`)
