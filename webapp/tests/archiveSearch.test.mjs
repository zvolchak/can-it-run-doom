import assert from "node:assert/strict"
import { after, test } from "node:test"
import { compileModules } from "./compileModules.mjs"

const modules = compileModules([
    "src/utils/archiveSearch.ts", "src/utils/projectDate.ts", "src/utils/archiveResults.ts", "src/utils/itemsFilters.ts",
    "src/utils/additionDates.ts", "src/types/FiltersType.ts", "src/store/filters.ts",
])
after(modules.dispose)
const { searchArchive, normalizeSearch } = modules.load("src/utils/archiveSearch.ts")
const { archiveResults } = modules.load("src/utils/archiveResults.ts")
const { appliedFiltersSlice: { reducer, actions } } = modules.load("src/store/filters.ts")
const entries = [
    { id: "camera", title: "Digital Camera", authors: [{ name: "Alice Example" }], tags: ["baremetal", "custom hardware"], publishDate: "Aug 8, 2014" },
    { id: "calculator", title: "Scientific Calculator", authors: [{ name: "Bob Other" }], tags: ["baremetal"], publishDate: "2024-02-29" },
    { id: "unicode", title: "Café — ARM-powered", authors: [{ name: "René Smith-Jones" }], tags: ["CUSTOM Hardware"], publishDate: null },
]
const ids = query => searchArchive(entries, query).map(entry => entry.id)

test("every additional term narrows results across title, authors, tags and ID", () => {
    assert.deepEqual(ids("camera nonexistent"), [])
    assert.deepEqual(ids("camera alice #baremetal 2014"), ["camera"])
    assert.deepEqual(ids("example"), ["camera"])
    assert.deepEqual(ids("alice example"), ["camera"])
    assert.deepEqual(ids("camera calculator"), [])
    assert.deepEqual(ids("CALCUL"), ["calculator"])
})

test("hashtags and multiword tags use the same case and word rules as other terms", () => {
    assert.deepEqual(ids("#BAREMETAL"), ["camera", "calculator"])
    assert.deepEqual(ids("#custom hardware"), ["camera", "unicode"])
    assert.deepEqual(ids("camera #custom hardware"), ["camera"])
    assert.deepEqual(ids("#camera"), []) // A hashtag cannot match just the title or ID.
    assert.deepEqual(ids("#"), [])
    assert.deepEqual(ids("#custom #baremetal"), ["camera"])
})

test("Unicode, punctuation and word prefixes work for compound titles and author surnames", () => {
    assert.deepEqual(ids("CAFÉ ARM pow smith jon"), ["unicode"])
    assert.deepEqual(ids("ＲＥＮÉ"), ["unicode"])
    assert.deepEqual(ids("smith-jones"), ["unicode"])
    assert.deepEqual(ids("—"), ["unicode"])
    assert.deepEqual(ids("++++"), [])
    assert.deepEqual(ids("  camera\t \n alice  "), ["camera"])
    assert.equal(normalizeSearch("  camera\t \n alice  "), "camera alice")
    assert.equal(normalizeSearch(null), "")
    assert.strictEqual(searchArchive(entries, " \n "), entries)
})

test("only validated project dates are searchable, with stable month and ISO spellings", () => {
    assert.deepEqual(ids("August 2014"), ["camera"])
    assert.deepEqual(ids("2014-08-08"), ["camera"])
    assert.deepEqual(ids("feb 29 2024"), ["calculator"])
    const broken = [null, undefined, "", "invalid", "Feb 31, 2024", "2023-02-29", "2024-02-29T24:00:00Z"].map((publishDate, i) => ({ id: String(i), title: "Project", publishDate }))
    for (const query of ["date", "invalid", "2024", "2023", String(new Date().getFullYear())]) {
        assert.deepEqual(searchArchive(broken, query), [])
    }
    assert.deepEqual(searchArchive(broken, "project"), broken)
    const originalTZ = process.env.TZ
    try {
        for (const tz of ["Pacific/Honolulu", "Pacific/Auckland"]) {
            process.env.TZ = tz
            assert.deepEqual(ids("2014-08-08"), ["camera"])
        }
    } finally {
        if (originalTZ === undefined) delete process.env.TZ
        else process.env.TZ = originalTZ
    }
})

test("search composes with archive filters before ordering and pagination without changing records", () => {
    const original = JSON.stringify(entries)
    const result = archiveResults(entries, {
        tags: ["baremetal"], authors: ["Alice Example"], years: { start: 2010, end: 2020 },
        searchString: "example #custom", query: { sort: "oldest" }, page: 2,
    })
    assert.deepEqual(result.matches.map(entry => entry.id), ["camera"])
    assert.equal(result.page, 1)
    assert.equal(JSON.stringify(entries), original)
})

test("normalizing the same submission preserves page; clear preserves other filters and sort", () => {
    const state = reducer(undefined, actions.setAppliedFilters({
        searchString: "camera alice", tags: ["hardware"], authors: ["Alice"], years: { start: 2010, end: 2020 },
        page: 3, query: { sort: "added", hasCode: false },
    }))
    assert.equal(reducer(state, actions.setAppliedSearch("  camera\t alice ")).page, 3)
    const cleared = reducer(state, actions.setAppliedSearch(""))
    assert.equal(cleared.searchString, "")
    assert.equal(cleared.page, 1)
    for (const key of ["tags", "authors", "years", "query"]) assert.deepEqual(cleared[key], state[key])
})
