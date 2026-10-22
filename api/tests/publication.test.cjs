const assert = require("node:assert/strict")
const { test } = require("node:test")
const { readFileSync } = require("node:fs")
const { resolve, dirname } = require("node:path")
const ts = require("typescript")

// Execute real writer/approval modules against an in-memory transactional store.
// No Firebase initialization, credentials, network requests or live writes.
const statuses = { pending: "pending", published: "published", approved: "approved", rejected: "rejected", hidden: "hidden" }
function fixture() {
    const records = new Map()
    let clock = Date.parse("2026-10-21T12:00:00Z")
    let sequence = 0
    let retry = false
    let queue = Promise.resolve()
    const stamp = () => ({ toDate: () => new Date(clock++) })
    const snapshot = ref => ({ id: ref.id, exists: () => records.has(ref.path), data: () => records.get(ref.path) })
    const firestore = {
        Timestamp: { now: stamp },
        doc: (...args) => {
            const [collection, id] = args.length === 3 ? [args[1], args[2]] : args
            const name = typeof collection === "string" ? collection : collection.path
            const docId = id || `generated-${++sequence}`
            return { id: docId, path: `${name}/${docId}` }
        },
        runTransaction: (_db, callback) => {
            const task = queue.then(async () => {
                async function attempt(commit) {
                    const writes = []
                    const transaction = {
                        get: async ref => snapshot(ref),
                        set: (ref, fields) => writes.push(() => records.set(ref.path, fields)),
                        update: (ref, fields) => writes.push(() => records.set(ref.path, { ...records.get(ref.path), ...fields })),
                    }
                    const result = await callback(transaction)
                    if (commit) writes.forEach(write => write())
                    return result
                }
                if (retry) { retry = false; await attempt(false) }
                return attempt(true)
            })
            queue = task.catch(() => {})
            return task
        },
        arrayUnion: (...values) => values,
        query: (collection, ...conditions) => ({ collection, conditions }),
        where: (...args) => ({ kind: "where", args }),
        orderBy: (...args) => ({ kind: "order", args }),
        documentId: () => "__name__",
        startAfter: id => ({ kind: "after", id }),
        limit: count => ({ kind: "limit", count }),
        getDocs: async query => {
            const status = query.conditions.find(c => c.kind === "where")?.args[2]
            const after = query.conditions.find(c => c.kind === "after")?.id
            const limit = query.conditions.find(c => c.kind === "limit")?.count || Infinity
            const docs = [...records].filter(([path, value]) => path.startsWith(query.collection.path + "/") && (!status || value.status === status))
                .map(([path]) => snapshot({ path, id: path.split("/")[1] })).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
                .filter(doc => !after || doc.id > after).slice(0, limit)
            return { docs }
        },
    }
    const environment = {
        fbDb: {}, doomPortsCollection: { path: "doomPorts" }, doomPortsIncomingCollection: { path: "doomPorts-Incoming" },
        COLLECTION_NAME: { doomPorts: "doomPorts", doomPortsIncoming: "doomPorts-Incoming" },
        generateFirestoreId: () => `generated-${++sequence}`,
        EUserRole: { Moderator: "Moderator" }, getUserFromRequest: req => req.user,
        IsAuthorized: role => role === "Moderator", statusStringToEnum: status => statuses[status] || "published",
    }
    const cache = new Map()
    const routes = []
    function load(path) {
        path = resolve(__dirname, "..", path)
        if (cache.has(path)) return cache.get(path)
        const exports = {}
        cache.set(path, exports)
        const code = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText
        function localRequire(name) {
            if (name === "firebase/firestore") return firestore
            if (name === "express") return { Router: () => ({ post() {}, get: (_path, callback) => routes.push(callback) }) }
            if (name.endsWith("/@types")) return { EItemStatus: statuses }
            if (name.endsWith("/middleware")) return { authenticate() {}, authorizeByRole() {} }
            if (name.endsWith("/utils") || name === "./firebaseApp") return environment
            if (name.startsWith(".")) return load(resolve(dirname(path), name + ".ts"))
            return require(name)
        }
        new Function("require", "exports", "process", "console", code)(localRequire, exports, process, { ...console, error() {} })
        return exports
    }
    Object.assign(environment, load("utils/queries.ts"))
    return { records, load, stamp, retry: () => { retry = true }, routes }
}

test("direct creation uses server dates; concurrent/retried edits and republishing retain first addition", async () => {
    const f = fixture()
    const { addDoomPort, updateDoomPort } = f.load("utils/queries.ts")
    const spoof = f.stamp()
    f.retry()
    await addDoomPort({ id: "one", title: "One", status: "published", addedAt: spoof })
    const first = f.records.get("doomPorts/one")
    assert.notEqual(first.addedAt, spoof)
    await Promise.all([addDoomPort({ id: "one", status: "published", addedAt: spoof }), updateDoomPort("one", { status: "hidden", addedAt: spoof })])
    await updateDoomPort("one", { status: "published" })
    assert.equal(f.records.get("doomPorts/one").addedAt, first.addedAt)
    assert.equal(f.records.get("doomPorts/one").createdAt, first.createdAt)
})

test("pending submission dates never claim publication; approval establishes server date atomically", async () => {
    const f = fixture()
    const { createEntry } = f.load("routes/doom_ports/addEntries.ts")
    const { approveEntries } = f.load("routes/doom_ports/reviewEntries.ts")
    const incoming = await createEntry({ id: "target", title: "One", previewImg: "", status: "pending", addedAt: f.stamp() }, null)
    assert.equal(incoming.entry.addedAt, null)
    assert.equal(f.records.has("doomPorts/target"), false)
    f.retry()
    const result = await approveEntries([{ reviewId: incoming.id, entry: incoming.entry }], "approved")
    assert.equal(result.success.length, 1)
    assert.ok(f.records.get("doomPorts/target").addedAt)
    assert.equal(f.records.get(`doomPorts-Incoming/${incoming.id}`).status, "approved")
    assert.deepEqual(f.records.get("doomPorts/target").editHistory, [incoming.id])
    const repeated = await approveEntries([{ reviewId: incoming.id, entry: incoming.entry }], "approved")
    assert.equal(repeated.success.length, 0)
})

test("edit approvals preserve addition and creation; rejection never publishes", async () => {
    const f = fixture()
    const { createEntry } = f.load("routes/doom_ports/addEntries.ts")
    const { approveEntries } = f.load("routes/doom_ports/reviewEntries.ts")
    await createEntry({ id: "target", title: "Original", previewImg: "", status: "published" }, null)
    const first = f.records.get("doomPorts/target")
    const edit = await createEntry({ id: "target", title: "Edited", previewImg: "", status: "pending" }, null)
    await approveEntries([{ reviewId: edit.id, entry: edit.entry }], "approved")
    const edited = f.records.get("doomPorts/target")
    assert.equal(edited.title, "Edited")
    assert.equal(edited.addedAt, first.addedAt)
    assert.equal(edited.createdAt, first.createdAt)
    const rejected = await createEntry({ id: "rejected", title: "Reject", previewImg: "", status: "pending" }, null)
    await approveEntries([{ reviewId: rejected.id, entry: rejected.entry }], "rejected")
    assert.equal(f.records.has("doomPorts/rejected"), false)
    assert.equal(f.records.get(`doomPorts-Incoming/${rejected.id}`).status, "rejected")
})

test("legacy dates remain unknown, while proven never-published new records can receive a first date", async () => {
    const f = fixture()
    const { addDoomPort, updateDoomPort } = f.load("utils/queries.ts")
    f.records.set("doomPorts/legacy", { status: "hidden", createdAt: f.stamp() })
    await updateDoomPort("legacy", { status: "published", addedAt: f.stamp(), publicationState: "unpublished" })
    assert.equal(f.records.get("doomPorts/legacy").addedAt, null)
    await addDoomPort({ id: "new-hidden", status: "hidden" })
    await updateDoomPort("new-hidden", { status: "published" })
    assert.ok(f.records.get("doomPorts/new-hidden").addedAt)
    const { additionIso } = f.load("utils/publication.ts")
    assert.equal(additionIso("2026-10-21T12:00:00Z"), null)
    assert.equal(additionIso(null), null)
    assert.match(additionIso(f.stamp()), /^2026-10-21T12:00:00\.\d{3}Z$/)
})

test("cursor endpoint retrieves more than 200 with stable ID ties and preserves status authorization", async () => {
    const f = fixture()
    for (let n = 0; n < 425; n++) f.records.set(`doomPorts/${String(n).padStart(4, "0")}`, { status: "published", addedAt: n === 424 ? f.stamp() : null })
    f.records.set("doomPorts/private", { status: "hidden" })
    f.load("routes/doom_ports/getEntries.ts")
    async function request(query, user) {
        let code, body
        const res = { setHeader() {}, status: value => { code = value; return res }, json: value => { body = value } }
        await f.routes[0]({ query, user }, res)
        return { code, body }
    }
    let cursor
    const ids = []
    do {
        const result = await request({ pagination: "cursor", ...(cursor ? { cursor } : {}) })
        assert.equal(result.code, 200)
        ids.push(...result.body.items.map(i => i.id))
        cursor = result.body.pagination.nextCursor
    } while (cursor)
    assert.equal(ids.length, 425)
    assert.equal(new Set(ids).size, 425)
    assert.equal(ids.at(-1), "0424")
    assert.equal((await request({ pagination: "cursor", status: "hidden" })).code, 403)
    assert.equal((await request({ status: "pending" })).code, 403)
    assert.equal((await request({ pagination: "cursor", perPage: "0" })).code, 400)
    assert.equal((await request({ pagination: "cursor", cursor: "a/b" })).code, 400)
    const legacy = await request({})
    assert.equal(legacy.body.pagination, undefined)
    assert.equal(legacy.body.items.length, 200)
})
