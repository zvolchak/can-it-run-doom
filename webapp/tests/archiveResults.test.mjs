import assert from "node:assert/strict"
import { after, test } from "node:test"
import { compileModules } from "./compileModules.mjs"

const modules = compileModules([
    "src/utils/archiveResults.ts", "src/utils/itemsFilters.ts", "src/types/FiltersType.ts", "src/store/filters.ts",
])
after(modules.dispose)
const { archiveResults, activeArchiveFilters, paginationPages } = modules.load("src/utils/archiveResults.ts")
const { appliedFiltersSlice, isFilterApplied } = modules.load("src/store/filters.ts")
const { getAuthorsFromItems, getTagsFromItems, getYearsFromItems } = modules.load("src/utils/itemsFilters.ts")
const { reducer, actions } = appliedFiltersSlice
const filters = overrides => ({ tags: [], authors: [], ids: [], years: null, searchString: "", page: 1, query: {}, ...overrides })
const item = (id, overrides = {}) => ({
    id, title: `Project ${id}`, description: "", publishDate: "2024-01-01", previewImg: "",
    tags: ["hardware"], authors: [{ name: "Author", url: "" }], sourcesUrl: [], sourceCodeUrl: [], isFirstLevelComplete: false, ...overrides,
})

test("matching counts and facets use every result, independent of the visible page", () => {
    const items = Array.from({ length: 25 }, (_, index) => item(String(index + 1)))
    const first = archiveResults(items, filters())
    const last = archiveResults(items, filters({ page: 3 }))
    assert.equal(first.total, 25)
    assert.equal(first.matches.length, 25)
    assert.equal(first.pageItems.length, 10)
    assert.equal(first.numberOfPages, 3)
    assert.equal(last.total, 25)
    assert.deepEqual(last.pageItems.map(item => item.id), ["21", "22", "23", "24", "25"])
    assert.equal(last.first, 21)
    assert.equal(last.last, 25)
})

test("out-of-range pages clamp after filtering and empty results remain on page one", () => {
    const items = [item("camera", { title: "Camera" }), item("calculator", { title: "Calculator" })]
    const result = archiveResults(items, filters({ page: 100, searchString: "Camera" }))
    assert.equal(result.page, 1)
    assert.equal(result.total, 1)
    const empty = archiveResults(items, filters({ page: 100, searchString: "nonexistent-query" }))
    assert.equal(empty.total, 0)
    assert.equal(empty.page, 1)
    assert.equal(empty.numberOfPages, 0)
    assert.equal(empty.first, 0)
    assert.equal(empty.last, 0)
    assert.deepEqual(empty.pageItems, [])
})

test("default archive ordering and explicit newest/oldest ordering stay distinct", () => {
    const items = [item("mid", { publishDate: "2024-01-01" }), item("old", { publishDate: "2000-01-01" }), item("new", { publishDate: "2025-01-01" })]
    assert.deepEqual(archiveResults(items, filters()).matches.map(item => item.id), ["mid", "old", "new"])
    assert.deepEqual(archiveResults(items, filters({ query: { sort: "latest" } })).matches.map(item => item.id), ["new", "mid", "old"])
    assert.deepEqual(archiveResults(items, filters({ query: { sort: "oldest" } })).matches.map(item => item.id), ["old", "mid", "new"])
    assert.deepEqual(items.map(item => item.id), ["mid", "old", "new"])
})

test("all matching conditions, including year bounds, apply before a result limit", () => {
    const items = [item("old", { publishDate: "2000-01-01" }), item("new", { publishDate: "2024-01-01" }), item("newer", { publishDate: "2025-01-01" })]
    const result = archiveResults(items, filters({ years: { start: 2020, end: null }, query: { limit: "1" } }))
    assert.equal(result.total, 1)
    assert.equal(result.matches[0].id, "new")
})

test("false completion and code filters are equivalent as booleans and URL strings", () => {
    const items = [item("no-code"), item("code", { sourceCodeUrl: [{ name: "Repo", url: "https://example.com" }] }), item("completed", { isFirstLevelComplete: true })]
    for (const value of [false, "false"]) {
        const result = archiveResults(items, filters({ query: { hasCode: value, levelCompleted: value } }))
        assert.deepEqual(result.matches.map(item => item.id), ["no-code"])
    }
})

test("tags, authors, IDs, and collaboration limits combine without dropping credits", () => {
    const shared = item("shared", { authors: [{ name: "Author", url: "" }, { name: "Collaborator", url: "" }] })
    const result = archiveResults([item("solo"), shared], filters({ tags: ["hardware"], authors: ["Collaborator"], ids: ["shared"], query: { authorsPerItem: "2" } }))
    assert.deepEqual(result.matches.map(item => item.id), ["shared"])
    assert.equal(result.matches[0].authors.length, 2)
})

test("active chips cover each narrowing filter, include false, and exclude sorting", () => {
    const chips = activeArchiveFilters(filters({ searchString: "Camera", tags: ["hardware", "hardware"], authors: ["Author"], ids: ["shared"], years: { start: 2000, end: 2025 }, query: { sort: "latest", hasCode: false, levelCompleted: "false", authorsPerItem: 2, limit: 5 } }))
    assert.equal(chips.length, 9)
    assert.equal(new Set(chips.map(chip => chip.key)).size, 9)
    assert.ok(chips.some(chip => chip.label === "No source code listed"))
    assert.ok(chips.some(chip => chip.label === "First level: not marked complete"))
    assert.ok(!chips.some(chip => chip.group === "sort"))
})

test("null legacy collections and missing dates do not crash search, facets, or date filters", () => {
    const legacy = item("legacy", { authors: null, tags: null, publishDate: null, sourceCodeUrl: null })
    assert.equal(archiveResults([legacy], filters({ searchString: "Project" })).total, 1)
    assert.deepEqual(getAuthorsFromItems([legacy]), [])
    assert.deepEqual(getTagsFromItems([legacy]), [])
    assert.deepEqual(getYearsFromItems([legacy]), [])
    assert.equal(archiveResults([legacy], filters({ years: { start: null, end: 2000 } })).total, 0)
})

test("URL hydration preserves a requested page; editing a filter resets it", () => {
    const hydrated = reducer(undefined, actions.setAppliedFilters(filters({ page: 3, searchString: "Camera" })))
    assert.equal(hydrated.page, 3)
    assert.equal(reducer(hydrated, actions.setAppliedSearch("Calculator")).page, 1)
    assert.equal(reducer(hydrated, actions.setAppliedTags(["hardware"])).page, 1)
    assert.equal(reducer(hydrated, actions.setQuery({ sort: "oldest" })).page, 1)
})

test("reapplying unchanged search text does not reset pagination on input blur", () => {
    const state = reducer(undefined, actions.setAppliedFilters(filters({ page: 3, searchString: "Camera" })))
    assert.equal(reducer(state, actions.setAppliedSearch("Camera")).page, 3)
    assert.equal(reducer(state, actions.setAppliedTags([])).page, 3)
})

test("clear all restores default browsing and the applied-filter indicator recognizes false", () => {
    const state = reducer(undefined, actions.setAppliedFilters(filters({ page: 3, query: { levelCompleted: false } })))
    assert.equal(isFilterApplied({ appliedFilters: state }), true)
    const cleared = reducer(state, actions.clearAppliedFilters())
    assert.equal(cleared.page, 1)
    assert.equal(isFilterApplied({ appliedFilters: cleared }), false)
    assert.equal(isFilterApplied({ appliedFilters: filters({ query: { sort: "latest" } }) }), false)
})

test("pagination ranges have no duplicate pages or out-of-range links", () => {
    assert.deepEqual(paginationPages(1, 0), [])
    assert.deepEqual(paginationPages(1, 1), [1])
    assert.deepEqual(paginationPages(1, 2), [1, 2])
    for (let page = 1; page <= 10; page++) {
        const numbers = paginationPages(page, 10).filter(value => typeof value === "number")
        assert.equal(new Set(numbers).size, numbers.length)
        assert.ok(numbers.includes(1) && numbers.includes(10) && numbers.includes(page))
        assert.ok(numbers.every(value => value >= 1 && value <= 10))
    }
})
