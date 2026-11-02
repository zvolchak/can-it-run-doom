const assert = require("node:assert/strict")
const { test } = require("node:test")
const { readFileSync } = require("node:fs")
const { resolve } = require("node:path")
const ts = require("typescript")

const loaded = {}
new Function("exports", ts.transpileModule(readFileSync(resolve(__dirname, "../utils/corsOrigins.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText)(loaded)
const { parseCorsOrigins } = loaded

test("origins are split and trimmed", () => {
    assert.deepEqual(parseCorsOrigins("https://a.org, https://b.org"), ["https://a.org", "https://b.org"])
})

test("quotes kept by a secrets manager, escapes and trailing slashes don't break matching", () => {
    // The value as it has been seen in the generated .env file.
    assert.deepEqual(parseCorsOrigins('\\"https://nextserver-x.a.run.app, https://canitrundoom.org\\"'),
        ["https://nextserver-x.a.run.app", "https://canitrundoom.org"])
    assert.deepEqual(parseCorsOrigins('"https://canitrundoom.org/"'), ["https://canitrundoom.org"])
})

test("an empty or missing setting falls back to local development", () => {
    for (const raw of [undefined, "", " , "])
        assert.deepEqual(parseCorsOrigins(raw), ["http://localhost:3000"])
})
