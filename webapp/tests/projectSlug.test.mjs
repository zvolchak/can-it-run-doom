import assert from "node:assert/strict"
import { after, test } from "node:test"
import { compileModules } from "./compileModules.mjs"

const compiled = compileModules(["src/utils/projectSlug.ts"])
const { slugify, projectPath, projectIdCandidates } = compiled.load("src/utils/projectSlug.ts")
after(() => compiled.dispose())

test("slugify is ASCII, hyphenated, bounded, and empty when nothing usable remains", () => {
    assert.equal(slugify("Digital Camera: Kodak dc210 (1998)"), "digital-camera-kodak-dc210-1998")
    assert.equal(slugify("Doom & Gloom — Café"), "doom-and-gloom-cafe")
    assert.equal(slugify("パチンコ台"), "")
    assert.equal(slugify(undefined), "")
    const long = slugify("word ".repeat(40))
    assert.ok(long.length <= 60 && !long.endsWith("-"))
})

test("project paths end in the id and fall back to the bare id", () => {
    assert.equal(projectPath("8abea81b6a", "Doom as Neural Model"), "/entries/doom-as-neural-model-8abea81b6a")
    assert.equal(projectPath(1015, "パチンコ台"), "/entries/1015")
    assert.equal(projectPath("a/b", "x"), "/entries/x-a%2Fb")
})

test("id candidates try the whole segment, then the text after the last hyphen", () => {
    assert.deepEqual(projectIdCandidates("doom-as-neural-model-8abea81b6a"), ["doom-as-neural-model-8abea81b6a", "8abea81b6a"])
    assert.deepEqual(projectIdCandidates("1015"), ["1015"])
    assert.deepEqual(projectIdCandidates(""), [])
    assert.deepEqual(projectIdCandidates(undefined), [])
})
