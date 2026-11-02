import assert from "node:assert/strict"
import { after, test } from "node:test"
import { compileModules } from "./compileModules.mjs"

const compiled = compileModules(["src/utils/shareProject.ts"])
const { projectShareUrl, shareProject } = compiled.load("src/utils/shareProject.ts")
after(() => compiled.dispose())

test("share URL is canonical regardless of origin slashes or id type", () => {
    assert.equal(projectShareUrl("https://canitrundoom.org/", 1043), "https://canitrundoom.org/entries?id=1043")
    assert.equal(projectShareUrl("http://localhost:3000", "a b"), "http://localhost:3000/entries?id=a%20b")
})

test("native share wins, cancel is silent, other failures fall back to the clipboard", async () => {
    const copied = []
    const clipboard = { writeText: async text => { copied.push(text) } }
    assert.equal(await shareProject({ share: async () => {}, clipboard }, "t", "u"), "shared")
    assert.equal(await shareProject({ share: async () => { throw Object.assign(new Error(), { name: "AbortError" }) }, clipboard }, "t", "u"), "cancelled")
    assert.deepEqual(copied, [])
    assert.equal(await shareProject({ share: async () => { throw new Error("nope") }, clipboard }, "t", "u"), "copied")
    assert.equal(await shareProject({ clipboard }, "t", "u2"), "copied")
    assert.deepEqual(copied, ["u", "u2"])
})

test("missing or rejecting clipboard reports failure", async () => {
    assert.equal(await shareProject({}, "t", "u"), "failed")
    assert.equal(await shareProject({ clipboard: { writeText: async () => { throw new Error() } } }, "t", "u"), "failed")
})

test("platform share links encode the URL and title", () => {
    const { shareTargets } = compiled.load("src/utils/shareProject.ts")
    const url = "https://canitrundoom.org/entries?id=1"
    const targets = Object.fromEntries(shareTargets("Doom & Co #1", url).map(target => [target.id, target.href]))
    assert.deepEqual(Object.keys(targets), ["x", "facebook", "reddit", "bluesky", "linkedin"])
    assert.ok(targets.x.startsWith("https://x.com/intent/post?url=https%3A%2F%2Fcanitrundoom.org%2Fentries%3Fid%3D1&text=Doom%20%26%20Co%20%231"))
    assert.ok(targets.reddit.includes("title=Doom%20%26%20Co%20%231"))
    for (const href of Object.values(targets)) assert.ok(!href.includes("entries?id=1&") || href.includes("%3Fid%3D1"))
})
