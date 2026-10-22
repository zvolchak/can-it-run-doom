import assert from "node:assert/strict"
import { after, test } from "node:test"
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"
import ts from "typescript"

// Node 20 cannot execute TypeScript directly. Compile this dependency-free
// utility with the project's existing compiler; no additional runner is needed.
const directory = mkdtempSync(join(tmpdir(), "doom-project-navigation-"))
const compiled = join(directory, "projectNavigation.cjs")
const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../src/utils/projectNavigation.ts"), "utf8")
writeFileSync(compiled, ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)
const loadCompiled = createRequire(import.meta.url)
const { archiveFilters, archiveHref, archiveQuery, archiveQueryKey, queryValues } = loadCompiled(compiled)
after(() => rmSync(directory, { recursive: true, force: true }))

const filters = overrides => ({
    tags: [], authors: [], ids: [], years: null, searchString: "", page: 1, query: {}, ...overrides,
})

test("opening a project captures Redux changes instead of stale URL filters", () => {
    const query = archiveQuery({ search: "old", tag: "old-tag", page: "4", project: "old" }, filters({
        searchString: "Neural", tags: ["machine-learning"], authors: ["Dani Valevski"],
        years: { start: 2020, end: 2025 }, page: 2,
    }))
    assert.deepEqual(query, { search: "Neural", tag: "machine-learning", tagMatch: "any", page: "2", author: "Dani Valevski", yearstart: "2020", yearend: "2025" })
})

test("cleared filters disappear while unrelated and repeated query parameters survive", () => {
    const original = { search: "old", tag: "old", author: "old", id: "1009", yearstart: "2000", yearend: "2025", sort: "latest", hasCode: "true", project: "1009", qa: ["one", "two"] }
    const query = archiveQuery(original, filters())
    assert.deepEqual(query, { page: "1", qa: ["one", "two"] })
    assert.equal(original.project, "1009")
    assert.equal(original.search, "old")
})

test("advanced false values, sort, limit, collaboration count, and ID filters survive", () => {
    const query = archiveQuery({}, filters({ ids: ["1043", "1009"], query: {
        levelCompleted: false, hasCode: false, sort: "oldest", limit: 20, authorsPerItem: 4,
    } }))
    assert.deepEqual(query, { id: "1043,1009", page: "1", levelCompleted: "false", hasCode: "false", sort: "oldest", limit: "20", authorsPerItem: "4" })
    const parsed = archiveFilters(query)
    assert.deepEqual(parsed.ids, ["1043", "1009"])
    assert.equal(parsed.query.hasCode, "false")
})

test("modal changes have no effect on the browsing-state identity", () => {
    assert.equal(archiveQueryKey({ page: "2", tag: "baremetal", project: "1009" }), archiveQueryKey({ project: "1043", tag: "baremetal", page: "2" }))
    assert.notEqual(archiveQueryKey({ page: "1" }), archiveQueryKey({ page: "2" }))
})

test("repeated and comma-separated author, tag, and ID parameters remain compatible", () => {
    assert.deepEqual(queryValues(["1043,1009", "1001"]), ["1043", "1009", "1001"])
    const parsed = archiveFilters({ tag: ["baremetal", "custom hardware"], author: ["One,Two", "Three"], id: "1043,1009" })
    assert.deepEqual(parsed.tags, ["baremetal", "custom hardware"])
    assert.deepEqual(parsed.authors, ["One", "Two", "Three"])
    assert.deepEqual(parsed.ids, ["1043", "1009"])
})

test("literal percent signs and already-decoded values are not decoded again", () => {
    const parsed = archiveFilters({ search: "100% Doom + café", author: "Someone %2F", project: "1043" })
    assert.equal(parsed.searchString, "100% Doom + café")
    assert.deepEqual(parsed.authors, ["Someone %2F"])
    assert.ok(!("project" in parsed.query))
})

test("project hrefs encode special characters and preserve repeated parameters", () => {
    const href = archiveHref("/entries", { search: "100% Doom + café", qa: ["one", "two"], project: "1043" })
    const parsed = new URL(href, "https://archive.example")
    assert.equal(parsed.pathname, "/entries")
    assert.equal(parsed.searchParams.get("search"), "100% Doom + café")
    assert.deepEqual(parsed.searchParams.getAll("qa"), ["one", "two"])
    assert.equal(parsed.searchParams.get("project"), "1043")
    assert.equal(archiveHref("/entries", {}), "/entries")
})

test("invalid pages fall back to page one", () => {
    for (const page of [undefined, "", "-1", "0", "2.5", "NaN", "Infinity"]) {
        assert.equal(archiveFilters({ page }).page, 1)
    }
    assert.equal(archiveFilters({ page: "3" }).page, 3)
})

test("repeated advanced options normalize to scalar values for existing filters", () => {
    const parsed = archiveFilters({ levelCompleted: ["true", "false"], sort: ["latest", "oldest"] })
    assert.equal(parsed.query.levelCompleted, "true")
    assert.equal(parsed.query.sort, "latest")
})

test("tag modes preserve old OR URLs and round trip explicit All", () => {
    for (const tagMatch of [undefined, "unknown", "any"]) assert.equal(archiveFilters({ tag: ["one", "two"], tagMatch }).tagMatch, "any")
    assert.equal(archiveFilters({}).tagMatch, "all")
    const query = archiveQuery({}, filters({ tags: ["one", "two"], tagMatch: "all" }))
    assert.equal(archiveFilters(query).tagMatch, "all")
    assert.equal(archiveQuery(query, filters()).tagMatch, undefined)
})
