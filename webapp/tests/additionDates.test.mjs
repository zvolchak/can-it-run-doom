import assert from "node:assert/strict"
import { after, test } from "node:test"
import { compileModules } from "./compileModules.mjs"
const modules = compileModules(["src/utils/additionDates.ts", "src/utils/archiveRetrieval.ts", "src/utils/archiveSearch.ts", "src/utils/projectDate.ts", "src/utils/archiveResults.ts", "src/utils/itemsFilters.ts", "src/types/FiltersType.ts"])
after(modules.dispose)
const { archiveAdditionDate, additionTime, normalizeAddition, isJustAdded, recentAdditions, orderByAddition, nextAdditionBoundary, JUST_ADDED_WINDOW } = modules.load("src/utils/additionDates.ts")
const { retrievePublishedArchive } = modules.load("src/utils/archiveRetrieval.ts")
const { archiveResults } = modules.load("src/utils/archiveResults.ts")
const now = Date.parse("2026-10-21T12:00:00Z")
const iso = age => new Date(now - age).toISOString()
const item = (id, age) => ({ id, addedAt: age === null ? null : iso(age) })

test("rolling UTC window includes zero age and expires at exactly ten days", () => {
    for (const [age, eligible] of [[0, true], [JUST_ADDED_WINDOW - 1, true], [JUST_ADDED_WINDOW, false], [JUST_ADDED_WINDOW + 1, false], [-1, false]]) {
        assert.equal(isJustAdded(iso(age), now), eligible)
    }
    assert.equal(normalizeAddition("2026-10-21T06:00:00-06:00"), iso(0))
    assert.equal(isJustAdded("2026-10-21T06:00:00-06:00", now), true)
})

test("invalid, missing, local and impossible dates have no addition instant", () => {
    for (const value of [null, undefined, "", "bad", 100, {}, "2026-10-21", "2026-10-21T12:00:00", "2026-02-30T00:00:00Z", "2026-10-21T24:00:00Z"]) {
        assert.equal(additionTime(value), null)
        assert.equal(isJustAdded(value, now), false)
    }
})

test("recent selection is deterministic, limited to ten, and excludes future and unknown dates", () => {
    const records = [item("future", -1), item("unknown", null), item("b", 0), item("a", 0), ...Array.from({ length: 12 }, (_, n) => item(`old-${n}`, (n + 11) * JUST_ADDED_WINDOW))]
    const result = recentAdditions(records, now)
    assert.equal(result.length, 10)
    assert.deepEqual(result.slice(0, 2).map(i => i.id), ["a", "b"])
    assert.ok(!result.some(i => ["future", "unknown"].includes(i.id)))
    assert.equal(result.filter(i => isJustAdded(i.addedAt, now)).length, 2)
    assert.deepEqual(recentAdditions([item("old", JUST_ADDED_WINDOW + 1)], now).map(i => i.id), ["old"])
    assert.equal(recentAdditions([], now).length, 0)
    assert.equal(records[0].id, "future")
    assert.equal(orderByAddition([item("z", null), item("a", 0)])[1].id, "z")
})

test("one boundary scheduler covers future arrivals and exact expiration without polling", () => {
    assert.equal(nextAdditionBoundary([item("old", JUST_ADDED_WINDOW), item("unknown", null)], now), null)
    assert.equal(nextAdditionBoundary([item("today", 0)], now), now + JUST_ADDED_WINDOW)
    assert.equal(nextAdditionBoundary([item("future", -20), item("expires", JUST_ADDED_WINDOW - 10)], now), now + 10)
})

test("complete retrieval reaches recent records beyond 200 and added browsing has no implicit limit", async () => {
    const records = Array.from({ length: 425 }, (_, n) => ({ ...item(String(n).padStart(4, "0"), 425 - n), updatedAt: iso(n) }))
    const calls = []
    const all = await retrievePublishedArchive(async cursor => {
        calls.push(cursor)
        const start = cursor ? Number(cursor) : 0
        return { items: records.slice(start, start + 200), pagination: { nextCursor: start + 200 < records.length ? String(start + 200) : null } }
    })
    assert.deepEqual(calls, [undefined, "200", "400"])
    assert.equal(all.length, 425)
    assert.equal(all[0].id, "0000") // updated order remains the default
    assert.equal(recentAdditions(all, now)[0].id, "0424")
    const result = archiveResults(all, { tags: [], authors: [], page: 2, query: { sort: "added" } })
    assert.equal(result.total, 425)
    assert.equal(result.numberOfPages, 43)
    assert.equal(result.pageItems[0].id, "0414")
})

test("retrieval deduplicates overlaps, normalizes dates and rejects partial/stalled responses", async () => {
    let calls = 0
    const items = await retrievePublishedArchive(async () => ++calls === 1
        ? { items: [item("a", 0)], pagination: { nextCursor: "a" } }
        : { items: [item("a", 0), { id: "b", addedAt: "bad" }], pagination: { nextCursor: null } })
    assert.equal(items.length, 2)
    assert.equal(items.find(i => i.id === "b").addedAt, null)
    for (const fetchPage of [
        async () => ({ items: [] }),
        async () => ({ items: [item("a", 0)], pagination: { nextCursor: "repeat" } }),
        async () => { throw Error("network failure") },
    ]) await assert.rejects(retrievePublishedArchive(fetchPage))
    calls = 0
    await assert.rejects(retrievePublishedArchive(async () => ++calls === 1
        ? { items: [item("a", 0)], pagination: { nextCursor: "a" } }
        : Promise.reject(Error("second page failed"))))
})


test("legacy createdAt drives the same selection, sorting, labels, badges and expiry policy", async () => {
    const legacy = { id: "legacy", addedAt: null, createdAt: iso(JUST_ADDED_WINDOW - 1) }
    const newest = { id: "newest", createdAt: "2026-10-21T06:00:00-06:00" }
    const published = { id: "published", addedAt: iso(1000), createdAt: iso(-1000) }
    const unknown = { id: "unknown", createdAt: "bad" }
    const future = { id: "future", addedAt: iso(-1000), createdAt: iso(0) }
    const records = [legacy, unknown, future, published, newest]
    assert.equal(archiveAdditionDate(legacy), legacy.createdAt)
    assert.equal(archiveAdditionDate(newest), iso(0))
    assert.equal(archiveAdditionDate(published), published.addedAt)
    assert.equal(archiveAdditionDate(future), future.addedAt)
    assert.equal(archiveAdditionDate(unknown), null)
    assert.deepEqual(recentAdditions(records, now).map(i => i.id), ["newest", "published", "legacy"])
    assert.equal(isJustAdded(archiveAdditionDate(legacy), now), true)
    assert.equal(isJustAdded(archiveAdditionDate(legacy), now + 1), false)
    assert.equal(nextAdditionBoundary(records, now), now + 1)
    assert.deepEqual(archiveResults(records, { tags: [], authors: [], query: { sort: "added" } }).matches.map(i => i.id), ["future", "newest", "published", "legacy", "unknown"])
    const [normalized] = await retrievePublishedArchive(async () => ({
        items: [newest], pagination: { nextCursor: null },
    }))
    assert.equal(normalized.createdAt, iso(0))
    assert.equal(normalized.addedAt, null) // Do not turn the approximation into first-publication data.
    assert.equal(newest.createdAt, "2026-10-21T06:00:00-06:00")
    assert.equal(recentAdditions([{ id: "old", createdAt: iso(JUST_ADDED_WINDOW + 1) }], now).length, 1)
})
