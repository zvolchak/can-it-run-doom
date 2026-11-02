const assert = require("node:assert/strict")
const { test } = require("node:test")
const { readFileSync } = require("node:fs")
const { resolve, dirname } = require("node:path")
const ts = require("typescript")

// Runs the real validation module; only the Firestore Timestamp import is stubbed.
const cache = new Map()
function load(path) {
    path = resolve(__dirname, "..", path)
    if (cache.has(path)) return cache.get(path)
    const exports = {}
    cache.set(path, exports)
    const code = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText
    const localRequire = name => {
        if (name === "firebase-admin/firestore") return { Timestamp: {} }
        if (name === "../@types") return { EItemStatus: { pending: "pending", published: "published" } }
        if (name.startsWith(".")) return load(resolve(dirname(path), name + ".ts"))
        return require(name)
    }
    new Function("require", "exports", "console", code)(localRequire, exports, console)
    return exports
}
const { validateSubmission, enforceSubmissionStatus, validateTags, isHttpUrl, sanitizePreviewImg } = load("utils/submission.ts")

const known = new Set(["raspberry-pi", "linux", "camera"])
const valid = () => ({
    title: "Doom on a toaster",
    description: "Runs at 3 fps.",
    publishDate: "2024-05-01",
    authors: [{ name: "Ann", url: "https://reddit.com/u/ann" }],
    sourcesUrl: [{ name: "Video", url: "https://youtu.be/abc.def" }],
    sourceCodeUrl: [],
    tags: ["raspberry-pi", "linux"],
})

test("a complete submission passes", () => {
    assert.deepEqual(validateSubmission(valid(), known), [])
    // The form may send tags as a JSON string of arrays or comma separated text.
    assert.deepEqual(validateSubmission({ ...valid(), tags: "linux, camera", authors: JSON.stringify(valid().authors) }, known), [])
})

test("the probe that was published anonymously is now rejected", () => {
    const errors = validateSubmission({ id: "zz-probe-1", title: "", status: "published", tags: ["not-a-real-tag"], authors: [], publishDate: "2024-01-01" }, known)
    assert.ok(errors.includes("Title is required"))
    assert.ok(errors.some(e => e.startsWith("Authors")))
    assert.ok(errors.includes("Unknown tags: not-a-real-tag"))
})

test("dates, ids and urls are checked", () => {
    assert.ok(validateSubmission({ ...valid(), publishDate: "not a date" }, known).includes("Publish date is required"))
    assert.ok(validateSubmission({ ...valid(), publishDate: "2999-01-01" }, known).includes("Publish date can't be in the future"))
    assert.ok(validateSubmission({ ...valid(), id: "../doomPorts/x" }, known).some(e => e.startsWith("id:")))
    assert.ok(validateSubmission({ ...valid(), authors: [{ name: "Ann", url: "javascript:alert(1)" }] }, known).some(e => e.startsWith("Authors")))
    assert.ok(validateSubmission({ ...valid(), sourceCodeUrl: [{ name: "Repo", url: "ftp://example.com/x" }] }, known).some(e => e.startsWith("Source code")))
    assert.equal(isHttpUrl("example"), false)
    assert.equal(isHttpUrl("http://localhost:3000"), false)
})

test("tags are required, and checked against the curated list when it is available", () => {
    assert.ok(validateSubmission({ ...valid(), tags: [] }, known).includes("Pick at least one tag"))
    assert.deepEqual(validateSubmission({ ...valid(), tags: ["anything"] }, new Set()), [])
    assert.deepEqual(validateTags(["linux"], known), [])
    assert.deepEqual(validateTags("linux,nope", known), ["Unknown tags: nope"])
    assert.deepEqual(validateTags([], known), ["Pick at least one tag"])
})

test("only moderators keep a requested status", () => {
    const requested = () => [{ status: "published" }, { status: undefined }]
    assert.deepEqual(enforceSubmissionStatus(requested(), false).map(i => i.status), ["pending", "pending"])
    assert.deepEqual(enforceSubmissionStatus(requested(), true).map(i => i.status), ["published", undefined])
})

test("preview images are limited to our own uploaded files", () => {
    const own = "/v0/b/bkt/o/doom-preview-images%2Fabc123.png?alt=media"
    assert.equal(sanitizePreviewImg(own, "bkt"), own)
    for (const bad of ["https://tracker.example/p.gif", "//evil.example/x", "/v0/b/other/o/doom-preview-images%2Fa.png?alt=media",
        "/v0/b/bkt/o/doom-preview-images%2F..%2Fa.png?alt=media", undefined, 5])
        assert.equal(sanitizePreviewImg(bad, "bkt"), null)
    assert.equal(sanitizePreviewImg(own, undefined), null)
})
