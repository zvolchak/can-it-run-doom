const assert = require("node:assert/strict")
const { test } = require("node:test")
const { readFileSync } = require("node:fs")
const { resolve } = require("node:path")
const ts = require("typescript")

const loaded = {}
new Function("exports", ts.transpileModule(readFileSync(resolve(__dirname, "../utils/sourceNames.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText)(loaded)
const { sourceNameFromUrl } = loaded

test("the API names links the same way the form preview does", () => {
    assert.equal(sourceNameFromUrl("https://github.com/aal80/agentcore-doom"), "aal80/agentcore-doom")
    assert.equal(sourceNameFromUrl("https://youtu.be/abc"), "YouTube")
    assert.equal(sourceNameFromUrl("https://www.cemetech.net/downloads/files/755/x755"), "cemetech.net")
    assert.equal(sourceNameFromUrl("https://github.com.evil.example/a/b"), "github.com.evil.example")
    assert.equal(sourceNameFromUrl("javascript:alert(1)"), null)
})

test("the two copies of the helper stay identical", () => {
    const api = readFileSync(resolve(__dirname, "../utils/sourceNames.ts"), "utf8").split("\n").slice(2).join("\n")
    const web = readFileSync(resolve(__dirname, "../../webapp/src/utils/sourceNames.ts"), "utf8").split("\n").slice(2).join("\n")
    assert.equal(api, web)
})
