import assert from "node:assert/strict"
import { afterEach, test } from "node:test"
import { readFileSync } from "node:fs"
import vm from "node:vm"
import ts from "typescript"
import * as firebase from "firebase/app"

const source = ts.transpileModule(readFileSync(new URL("../src/utils/analytics.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

afterEach(async () => {
    await Promise.all(firebase.getApps().map(app => firebase.deleteApp(app)))
})

// Evaluate fresh copies against the real Firebase registry to reproduce module
// reloads. Stub analytics calls so tests never load scripts or send telemetry.
function load({ browser = true, production = true, analytics = createAnalytics() } = {}) {
    const module = { exports: {} }
    vm.runInNewContext(source, {
        exports: module.exports,
        module,
        ...(browser ? { window: {} } : {}),
        process: { env: {
            NEXT_PUBLIC_FIREBASE_API_KEY: "qa-new-key",
            NEXT_PUBLIC_FIREBASE_PROJECT_ID: "qa-project",
            NEXT_PUBLIC_FIREBASE_APP_ID: "qa-app",
        } },
        require(name) {
            if (name === "firebase/app") return firebase
            if (name === "firebase/analytics") return analytics.sdk
            if (name === "@/src/utils") return { IsProd: () => production }
            throw new Error(`Unexpected dependency: ${name}`)
        },
    }, { filename: "analytics.js" })
    return { ...module.exports, analytics }
}

function createAnalytics() {
    const calls = []
    const instances = new Map()
    const sdk = {
        getAnalytics(app) {
            calls.push(["getAnalytics", app])
            if (!instances.has(app)) instances.set(app, { app })
            return instances.get(app)
        },
    }
    for (const name of ["setAnalyticsCollectionEnabled", "setUserId", "setUserProperties", "logEvent"]) {
        sdk[name] = (...args) => calls.push([name, ...args])
    }
    return { sdk, calls }
}

test("production SSR never initializes Firebase or logs browser analytics", () => {
    const app = load({ browser: false })
    app.initFbApp()
    app.trackPageView({}, "/", "session")
    assert.equal(app.fbApp, null)
    assert.equal(app.analyticsApp, null)
    assert.equal(firebase.getApps().length, 0)
    assert.deepEqual(app.analytics.calls, [])
})

test("development skips initialization even when an existing app has different options", () => {
    const existing = firebase.initializeApp({ apiKey: "qa-old-key", projectId: "old-project" })
    const app = load({ production: false })
    app.initFbApp()
    app.trackPageView({}, "/", "session")
    assert.equal(app.fbApp, null)
    assert.equal(app.analyticsApp, null)
    assert.strictEqual(firebase.getApp(), existing)
    assert.deepEqual(app.analytics.calls, [])
})

test("module reloads reuse the existing default app despite changed configuration", () => {
    const existing = firebase.initializeApp({ apiKey: "qa-old-key", projectId: "old-project" })
    const analytics = createAnalytics()
    const first = load({ analytics })
    const reloaded = load({ analytics })
    assert.strictEqual(first.fbApp, existing)
    assert.strictEqual(reloaded.fbApp, existing)
    assert.strictEqual(reloaded.analyticsApp, first.analyticsApp)
    assert.equal(firebase.getApps().length, 1)
})

test("production creates one default app and configures analytics only once per module", () => {
    const app = load()
    for (let index = 0; index < 3; index++) {
        assert.strictEqual(app.initFbApp().analyticsApp, app.analyticsApp)
    }
    assert.equal(firebase.getApps().length, 1)
    assert.equal(app.fbApp.options.projectId, "qa-project")
    const calls = app.analytics.calls
    assert.equal(calls.filter(call => call[0] === "getAnalytics").length, 1)
    assert.equal(calls.find(call => call[0] === "setAnalyticsCollectionEnabled")[2], false)
    assert.equal(calls.find(call => call[0] === "setUserId")[2], null)
    assert.equal(calls.find(call => call[0] === "setUserProperties")[2].allow_ad_personalization_signals, false)
})

test("a named app does not prevent initializing the default app", () => {
    const other = firebase.initializeApp({ projectId: "other-project" }, "other-service")
    const app = load()
    assert.equal(app.fbApp.name, "[DEFAULT]")
    assert.strictEqual(firebase.getApp("other-service"), other)
    assert.equal(firebase.getApps().length, 2)
})

test("page views retain their payload and ignore missing analytics or page", () => {
    const app = load()
    app.trackPageView(app.analyticsApp, "/entries", "session-one")
    app.trackPageView(null, "/entries", "session-one")
    app.trackPageView(app.analyticsApp, "", "session-one")
    const events = app.analytics.calls.filter(call => call[0] === "logEvent")
    assert.equal(events.length, 1)
    assert.strictEqual(events[0][1], app.analyticsApp)
    assert.equal(events[0][2], "page_view")
    assert.equal(events[0][3].page_path, "/entries")
    assert.equal(events[0][3].sessionId, "session-one")
})
