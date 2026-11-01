const assert = require("node:assert/strict")
const { test } = require("node:test")
const { readFileSync } = require("node:fs")
const ts = require("typescript")

function load(path) {
    const code = ts.transpileModule(readFileSync(path, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText
    const module = { exports: {} }
    new Function("module", "exports", "require", code)(module, module.exports, require)
    return module.exports
}

const { sortTags, tagFromDocument } = load("utils/tags.ts")

test("tags are grouped by category order, then sorted by label", () => {
    const sorted = sortTags([
        { id: "web", label: "Web", category: "software" },
        { id: "printer", label: "Printer", category: "device" },
        { id: "camera", label: "Camera", category: "device" },
        { id: "x", label: "Aardvark", category: "unknown" },
        { id: "linux", label: "Linux", category: "system" },
    ])
    assert.deepEqual(sorted.map(tag => tag.id), ["camera", "printer", "linux", "web", "x"])
})

test("a stored document becomes a tag keyed by its document id", () => {
    assert.deepEqual(tagFromDocument("camera", { label: "Camera", category: "device", description: "Cameras." }),
        { id: "camera", label: "Camera", category: "device", description: "Cameras." })
    assert.deepEqual(tagFromDocument("camera", { label: "Camera", category: "device" }),
        { id: "camera", label: "Camera", category: "device" })
})

test("documents missing a label or category are skipped", () => {
    assert.equal(tagFromDocument("a", { category: "device" }), null)
    assert.equal(tagFromDocument("a", { label: "A" }), null)
    assert.equal(tagFromDocument("a", undefined), null)
})
