import assert from "node:assert/strict"
import { after, test } from "node:test"
import { compileModules } from "./compileModules.mjs"

const modules = compileModules([
    "src/utils/archiveUrlCoordinator.ts", "src/utils/projectNavigation.ts", "src/utils/archiveSearch.ts", "src/utils/projectDate.ts",
    "src/utils/archiveResults.ts", "src/utils/itemsFilters.ts", "src/utils/additionDates.ts", "src/types/FiltersType.ts", "src/types/ItemEntryType.ts",
    "src/store/index.ts", "src/store/filters.ts", "src/store/submissions.ts", "src/store/settings.ts", "src/store/user.ts",
])
after(modules.dispose)
const { coordinateArchiveUrl } = modules.load("src/utils/archiveUrlCoordinator.ts")
const { archiveFilters } = modules.load("src/utils/projectNavigation.ts")
const { createAppStore, setAppliedSearch, setAppliedPage, setAppliedTags, setUserSessionId } = modules.load("src/store/index.ts")
const tick = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve() }

function setup(initial = "/?page=3", defer = false) {
    const listeners = new Map()
    const events = {
        on(event, fn) { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event).add(fn) },
        off(event, fn) { listeners.get(event)?.delete(fn) },
    }
    const emit = event => { for (const fn of listeners.get(event) || []) fn() }
    const target = { location: new URL(initial, "http://archive.local"), addEventListener: events.on, removeEventListener: events.off }
    let scheduled
    const calls = []
    const pending = []
    function navigate(method, href) {
        calls.push({ method, href })
        emit("routeChangeStart")
        return new Promise(resolve => {
            const commit = () => {
                emit("beforeHistoryChange")
                target.location = new URL(href, target.location)
                if (!defer) emit("routeChangeComplete")
                resolve(true)
            }
            if (defer) pending.push(commit)
            else commit()
        })
    }
    const router = { events, push: href => navigate("push", href), replace: href => navigate("replace", href) }
    const store = createAppStore()
    const dispose = coordinateArchiveUrl(store, () => router, target, callback => {
        scheduled = callback
        return () => { if (scheduled === callback) scheduled = undefined }
    })
    return {
        store, calls, pending, target, dispose,
        async run() { const fn = scheduled; scheduled = undefined; fn?.(); await tick() },
        async external(href, event = "popstate") { target.location = new URL(href, target.location); emit(event); await tick() },
        listenerCount: () => [...listeners.values()].reduce((count, set) => count + set.size, 0),
    }
}

test("stores start with URL filters and never share search or session state across requests", () => {
    const one = createAppStore(archiveFilters({ search: "Motorola", page: "2" }))
    const two = createAppStore(archiveFilters({ search: "Camera" }))
    one.dispatch(setAppliedSearch("changed"))
    one.dispatch(setUserSessionId("session-one"))
    assert.equal(two.getState().appliedFilters.searchString, "Camera")
    assert.equal(two.getState().user.data, null)
    assert.equal(createAppStore().getState().appliedFilters.searchString, undefined)
})

test("a submitted search pushes once, resets page, and an identical submission writes nothing", async () => {
    const qa = setup()
    qa.store.dispatch(setAppliedSearch("  Motorola  "))
    assert.equal(qa.calls.length, 0)
    await qa.run()
    assert.deepEqual(qa.calls, [{ method: "push", href: "/?page=1&search=Motorola" }])
    qa.store.dispatch(setAppliedPage(2))
    await qa.run()
    qa.store.dispatch(setAppliedSearch("Motorola"))
    await qa.run()
    assert.equal(qa.calls.length, 2)
    assert.equal(qa.store.getState().appliedFilters.page, 2)
    qa.dispose()
})

test("filter edits replace, page changes push, and Clear keeps tags and sort", async () => {
    const qa = setup("/entries?sort=added&search=Motorola&page=3")
    qa.store.dispatch(setAppliedTags(["baremetal"]))
    await qa.run()
    assert.equal(qa.calls[0].method, "replace")
    qa.store.dispatch(setAppliedPage(2))
    await qa.run()
    assert.equal(qa.calls[1].method, "push")
    qa.store.dispatch(setAppliedSearch(""))
    await qa.run()
    assert.equal(qa.calls[2].method, "push")
    assert.equal(qa.target.location.searchParams.has("search"), false)
    assert.equal(qa.target.location.searchParams.get("sort"), "added")
    assert.equal(qa.target.location.searchParams.get("tag"), "baremetal")
    qa.dispose()
})

test("Back/Forward hydrates immediately, cancels queued edits, and modal-only changes preserve drafts", async () => {
    const qa = setup("/?search=Camera&page=2")
    const beforeModal = qa.store.getState().appliedFilters
    await qa.external("/?search=Camera&page=2&project=1009")
    assert.strictEqual(qa.store.getState().appliedFilters, beforeModal)
    await qa.external("/?search=Camera&page=2")
    qa.store.dispatch(setAppliedSearch("queued"))
    await qa.external("/?search=Calculator&page=3")
    await qa.run()
    assert.equal(qa.store.getState().appliedFilters.searchString, "Calculator")
    assert.equal(qa.store.getState().appliedFilters.page, 3)
    assert.equal(qa.calls.length, 0)
    await qa.external("/?search=Camera&page=2", "routeChangeComplete")
    assert.equal(qa.store.getState().appliedFilters.searchString, "Camera")
    qa.dispose()
    assert.equal(qa.listenerCount(), 0)
})

test("committed URL events cannot overwrite a newer edit while router rendering is pending", async () => {
    const qa = setup("/?page=3", true)
    qa.store.dispatch(setAppliedSearch("first"))
    await qa.run()
    qa.store.dispatch(setAppliedSearch("second"))
    await qa.run()
    assert.equal(qa.calls.length, 1)
    qa.pending.shift()()
    await tick()
    assert.equal(qa.store.getState().appliedFilters.searchString, "second")
    assert.equal(qa.calls.length, 2)
    assert.equal(qa.calls[1].method, "push")
    qa.pending.shift()()
    await tick()
    assert.equal(qa.target.location.searchParams.get("search"), "second")
    qa.dispose()
})

test("unmount cancels queued and in-flight follow-up writes", async () => {
    const queued = setup()
    queued.store.dispatch(setAppliedSearch("queued"))
    queued.dispose()
    await queued.run()
    assert.equal(queued.calls.length, 0)
    const qa = setup("/?page=1", true)
    qa.store.dispatch(setAppliedSearch("first"))
    await qa.run()
    qa.store.dispatch(setAppliedSearch("second"))
    qa.dispose()
    qa.pending.shift()()
    await tick()
    assert.equal(qa.calls.length, 1)
    assert.equal(qa.listenerCount(), 0)
})
