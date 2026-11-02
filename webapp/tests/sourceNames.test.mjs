import assert from "node:assert/strict"
import { after, test } from "node:test"
import { compileModules } from "./compileModules.mjs"

const compiled = compileModules(["src/utils/sourceNames.ts"])
const { sourceNameFromUrl } = compiled.load("src/utils/sourceNames.ts")
after(() => compiled.dispose())

test("repository links are named owner/repo so several repos stay distinguishable", () => {
    assert.equal(sourceNameFromUrl("https://github.com/aal80/agentcore-doom"), "aal80/agentcore-doom")
    assert.equal(sourceNameFromUrl("https://www.github.com/id-Software/DOOM/tree/master/linuxdoom-1.10"), "id-Software/DOOM")
    assert.equal(sourceNameFromUrl("https://gitlab.com/someone/doom.git"), "someone/doom")
    assert.equal(sourceNameFromUrl("https://github.com/someone"), "someone")
    assert.equal(sourceNameFromUrl("https://github.com/"), "GitHub")
})

test("well-known sites get their proper names, including subdomains and short links", () => {
    assert.equal(sourceNameFromUrl("https://www.youtube.com/watch?v=abc"), "YouTube")
    assert.equal(sourceNameFromUrl("https://youtu.be/abc"), "YouTube")
    assert.equal(sourceNameFromUrl("https://old.reddit.com/r/doom/comments/1"), "Reddit")
    assert.equal(sourceNameFromUrl("https://x.com/someone/status/1"), "X")
})

test("other sites use their hostname, and unusable values give null", () => {
    assert.equal(sourceNameFromUrl("https://www.cemetech.net/downloads/files/755/x755"), "cemetech.net")
    assert.equal(sourceNameFromUrl("https://notgithub.com/a/b"), "notgithub.com")
    assert.equal(sourceNameFromUrl("https://github.com.evil.example/a/b"), "github.com.evil.example")
    for (const value of ["javascript:alert(1)", "not a url", "", null, undefined, "/relative"])
        assert.equal(sourceNameFromUrl(value), null)
    assert.equal(sourceNameFromUrl(`https://${"a".repeat(200)}.com/`).length, 100)
})
