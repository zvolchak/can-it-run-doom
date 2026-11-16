import assert from "node:assert/strict"
import { after, test } from "node:test"
import { compileModules } from "./compileModules.mjs"

const compiled = compileModules(["src/utils/seo.ts", "src/utils/additionDates.ts", "src/types/ItemEntryType.ts"])
const { buildSitemap, canonicalUrl, entryJsonLd, archiveJsonLd, jsonLdString, PRIVATE_PATHS, ITEM_LIST_LIMIT } = compiled.load("src/utils/seo.ts")
after(() => compiled.dispose())

const item = (id, extra = {}) => ({
    id, title: `Doom ${id}`, description: "Runs.", authors: [{ name: "Ada", url: "https://example.com/ada" }],
    sourcesUrl: [], sourceCodeUrl: [{ name: "repo", url: "https://github.com/a/b" }], isFirstLevelComplete: true,
    publishDate: "2020", tags: ["calculator"], previewImg: "", ...extra,
})

test("canonical is the entry for a standalone project and the root otherwise", () => {
    assert.equal(canonicalUrl(null), "https://canitrundoom.org/")
    assert.equal(canonicalUrl("a b"), "https://canitrundoom.org/entries?id=a%20b")
})

test("sitemap lists the root and each entry once, escaped, without invented dates", () => {
    const xml = buildSitemap([
        item("1", { addedAt: "2026-10-01T10:00:00.000Z" }),
        item("1"),
        item("a&b"),
        item(undefined),
    ])
    assert.equal((xml.match(/<url>/g) || []).length, 3)
    assert.match(xml, /<loc>https:\/\/canitrundoom\.org\/<\/loc><lastmod>2026-10-01T10:00:00\.000Z<\/lastmod>/)
    assert.match(xml, /entries\?id=1<\/loc><lastmod>2026-10-01T10:00:00\.000Z/)
    assert.match(xml, /entries\?id=a%26b<\/loc><\/url>/)
    for (const path of PRIVATE_PATHS) assert.ok(!xml.includes(path))
})

test("entry JSON-LD carries real facts and omits missing ones", () => {
    const data = entryJsonLd(item("7", { sourceCodeUrl: [], authors: [{ name: " ", url: "javascript:x" }] }))
    assert.equal(data["@type"], "CreativeWork")
    assert.equal(data.url, "https://canitrundoom.org/entries?id=7")
    assert.equal(data.author, undefined)
    assert.equal(data.codeRepository, undefined)
    assert.equal(entryJsonLd(item("8"))["@type"], "SoftwareSourceCode")
    assert.equal(entryJsonLd(item("8")).codeRepository, "https://github.com/a/b")
})

test("archive item list is capped but reports the full count", () => {
    const items = Array.from({ length: 100 }, (_, index) => item(String(index)))
    const [, list] = archiveJsonLd(items, "d")
    assert.equal(list.numberOfItems, 100)
    assert.equal(list.itemListElement.length, ITEM_LIST_LIMIT)
})

test("JSON-LD cannot close its script tag", () => {
    assert.ok(!jsonLdString({ name: "</script><b>" }).includes("</script"))
})
