import assert from "node:assert/strict"
import { after, test } from "node:test"
import { compileModules } from "./compileModules.mjs"

const compiled = compileModules(["src/utils/projectDate.ts", "src/components/Item/projectPresentation.ts"])
const { externalProjectUrl, projectAuthors, projectSources, projectDate } = compiled.load("src/components/Item/projectPresentation.ts")
after(() => compiled.dispose())

test("project links reject executable schemes, relative URLs, and malformed legacy values", () => {
    for (const value of ["javascript:alert(1)", "data:text/html,test", "//example.com", "/relative", "invalid", null]) {
        assert.equal(externalProjectUrl(value), null)
    }
    assert.equal(externalProjectUrl(" https://example.com/path ").href, "https://example.com/path")
    assert.equal(externalProjectUrl("http://example.com").protocol, "http:")
})

test("duplicate source names and URLs retain every record with unique stable keys", () => {
    const records = [{ name: "Same", url: "https://example.com/a" }, { name: "Same", url: "https://example.com/a" }, { name: "", url: "https://example.org/b" }]
    const sources = projectSources(records)
    assert.equal(sources.length, 3)
    assert.equal(new Set(sources.map(source => source.key)).size, 3)
    assert.deepEqual(sources, projectSources(records))
    assert.equal(sources[2].name, "example.org")
    assert.deepEqual(projectSources([null, { name: "Unsafe", url: "javascript:alert(1)" }]), [])
})

test("author credits survive missing URLs and invalid links without becoming executable", () => {
    const authors = projectAuthors([{ name: "Name only", url: "" }, { name: "Legacy", url: "javascript:alert(1)" }, { name: "", url: "https://example.com" }, null])
    assert.deepEqual(authors.map(({ name, url }) => ({ name, url })), [
        { name: "Name only", url: null }, { name: "Legacy", url: null }, { name: "example.com", url: "https://example.com/" },
    ])
    assert.deepEqual(projectAuthors(null), [])
    assert.deepEqual(projectSources(undefined), [])
})

test("calendar dates are timezone-stable and impossible or missing dates are omitted", () => {
    assert.deepEqual(projectDate("Aug 8, 2014"), { label: "August 8, 2014", year: "2014", dateTime: "2014-08-08" })
    assert.equal(projectDate("2024-02-29T23:30:00-02:00").dateTime, "2024-03-01")
    for (const value of ["Feb 31, 2024", "2023-02-29", "2024-13-01", "invalid", null]) assert.equal(projectDate(value), null)
})
