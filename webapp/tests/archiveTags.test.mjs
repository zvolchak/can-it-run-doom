import assert from "node:assert/strict"
import { after, test } from "node:test"
import { compileModules } from "./compileModules.mjs"

const modules = compileModules([
    "src/utils/additionDates.ts", "src/utils/archiveTags.ts", "src/utils/archiveFacets.ts", "src/utils/archiveSearch.ts", "src/utils/projectDate.ts", "src/utils/archiveResults.ts", "src/utils/itemsFilters.ts", "src/types/FiltersType.ts", "src/store/filters.ts",
])
after(modules.dispose)
const { archiveFacets } = modules.load("src/utils/archiveFacets.ts")
const filters = { tags: [], authors: [], ids: [], years: null, searchString: "", page: 1, query: {} }
const item = (id, tags) => ({
    id, title: `Project ${id}`, description: "", publishDate: "2024-01-01", previewImg: "",
    tags, authors: [{ name: "Author", url: "" }], sourcesUrl: [], sourceCodeUrl: [], isFirstLevelComplete: false,
})
const vocabulary = [
    { id: "raspberry-pi", label: "Raspberry Pi", category: "device" },
    { id: "camera", label: "Camera", category: "device" },
    { id: "linux", label: "Linux", category: "system" },
    { id: "unused", label: "Unused", category: "system" },
]

test("facets limited to the vocabulary leave out stray stored tags", () => {
    const items = [item("1", ["raspberry-pi", "Raspberry Pi", "linux"]), item("2", ["raspberry-pi"])]
    const allowed = new Set(vocabulary.map(tag => tag.id))
    assert.deepEqual(archiveFacets(items, filters, allowed).alphabetical, ["linux", "raspberry-pi"])
    assert.deepEqual(archiveFacets(items, filters, allowed).popular, ["raspberry-pi", "linux"])
    assert.deepEqual(archiveFacets(items, filters, allowed).ranked, ["raspberry-pi", "linux"])
    assert.ok(archiveFacets(items, filters).alphabetical.includes("Raspberry Pi"))
})
