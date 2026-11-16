import assert from "node:assert/strict"
import { after, test } from "node:test"
import { compileModules } from "./compileModules.mjs"

const compiled = compileModules(["src/utils/tagPages.ts", "src/utils/projectSlug.ts"])
const { tagPages, tagLabel, tagPath, TAG_PAGE_MIN_PROJECTS } = compiled.load("src/utils/tagPages.ts")
after(() => compiled.dispose())

const item = (...tags) => ({ id: String(Math.random()), title: "t", tags })

test("spelling variants share a page and count each project once", () => {
    const pages = tagPages([item("mp3 player"), item("mp3-player", "mp3 player"), item("MP3 Player"), item("rare")])
    const page = pages.get("mp3-player")
    assert.equal(page.count, 3)
    assert.deepEqual([...page.values].sort(), ["MP3 Player", "mp3 player", "mp3-player"])
    assert.equal(page.label, "Mp3 player")
    assert.equal(pages.has("rare"), false)
})

test("tags below the minimum, empty tags, and non-strings get no page", () => {
    assert.equal(TAG_PAGE_MIN_PROJECTS, 3)
    const pages = tagPages([item("a", "!!!", null), item("a"), item(undefined)])
    assert.equal(pages.size, 0)
    assert.equal(tagPages([item("a"), item("a")], 2).size, 1)
})

test("labels and paths are readable and URL safe", () => {
    assert.equal(tagLabel("classic-doom"), "Classic doom")
    assert.equal(tagPath("a b"), "/tags/a%20b")
})
