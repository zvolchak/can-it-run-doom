const assert = require("node:assert/strict")
const { test } = require("node:test")
const { readFileSync } = require("node:fs")
const { resolve } = require("node:path")
const ts = require("typescript")

// Runs the real notifications module with axios replaced by a recorder: no network calls.
function load(env = {}) {
    const calls = []
    let failOn = null
    const axios = {
        post: async (url, body, options) => { calls.push({ method: "post", url, body, options }); if (failOn === "post") throw new Error("boom") },
        patch: async (url, body, options) => { calls.push({ method: "patch", url, body, options }); if (failOn === "patch") throw new Error("boom") },
    }
    const code = ts.transpileModule(readFileSync(resolve(__dirname, "../utils/notifications.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText
    const exports = {}
    new Function("require", "exports", "process", "console", code)(
        name => name === "axios" ? { __esModule: true, default: axios } : {},
        exports, { env }, { ...console, error() {}, warn() {} })
    return { ...exports, calls, failOn: value => { failOn = value } }
}

const entry = { id: "pub1", title: "Doom on a toaster @everyone", requestUrl: "https://github.com/zvolchak/can-it-run-doom/issues/12" }

test("issue web addresses map to API addresses, and anything else is refused", () => {
    const { githubApiIssueUrl } = load()
    assert.equal(githubApiIssueUrl(entry.requestUrl), "https://api.github.com/repos/zvolchak/can-it-run-doom/issues/12")
    for (const bad of ["https://evil.example/zvolchak/x/issues/1", "https://github.com/a/b/pull/1", "http://github.com/a/b/issues/1", null, undefined, 7])
        assert.equal(githubApiIssueUrl(bad), null)
})

test("approval comments on and closes the issue as completed through the API", async () => {
    const { resolveIssue, calls } = load({ GITHUB_TOKEN: "t" })
    assert.equal(await resolveIssue(entry, true), true)
    assert.equal(calls[0].url, "https://api.github.com/repos/zvolchak/can-it-run-doom/issues/12/comments")
    assert.equal(calls[0].body.body, "Added: https://canitrundoom.org/?id=pub1")
    assert.equal(calls[0].options.headers.Authorization, "Bearer t")
    assert.deepEqual(calls[1].body, { state: "closed", state_reason: "completed" })
})

test("rejection closes the issue as not planned", async () => {
    const { resolveIssue, calls } = load({ GITHUB_TOKEN: "t" })
    assert.equal(await resolveIssue(entry, false), true)
    assert.match(calls[0].body.body, /rejected/)
    assert.equal(calls[1].body.state_reason, "not_planned")
})

test("missing token, missing issue link and API failures are reported, never thrown", async () => {
    assert.equal(await load().resolveIssue(entry, true), false)
    assert.equal(await load({ GITHUB_TOKEN: "t" }).resolveIssue({ ...entry, requestUrl: undefined }, true), false)
    const failing = load({ GITHUB_TOKEN: "t" })
    failing.failOn("patch")
    assert.equal(await failing.resolveIssue(entry, true), false)
})

test("discord posts never ping, and only when a webhook is configured", async () => {
    const quiet = load()
    assert.equal(await quiet.sendDiscordNotification(entry), false)
    assert.equal(quiet.calls.length, 0)
    const { sendDiscordNotification, calls } = load({ DISCORD_ENTRY_NOTIFY_WEBHOOK: "https://discord.example/hook" })
    assert.equal(await sendDiscordNotification(entry), true)
    assert.deepEqual(calls[0].body.allowed_mentions, { parse: [] })
    assert.match(calls[0].body.content, /pub1/)
})

test("notifications run in every environment except local development", () => {
    assert.equal(load({ NODE_ENV: "development" }).notificationsEnabled(), false)
    for (const env of ["production", "staging", undefined])
        assert.equal(load({ NODE_ENV: env }).notificationsEnabled(), true)
})

test("source code and author links on github credit their accounts in the comment", async () => {
    const { githubLogins, resolveIssue, calls } = load({ GITHUB_TOKEN: "t" })
    const credited = {
        ...entry,
        sourceCodeUrl: [
            { name: "Repo", url: "https://github.com/id-Software/DOOM/tree/master" },
            { name: "Fork", url: "https://www.github.com/id-software/DOOM-fork" },
            { name: "Other host", url: "https://gitlab.com/someone/doom" },
            { name: "Site page", url: "https://github.com/orgs/something/people" },
            { name: "Lookalike", url: "https://github.com.evil.example/mallory/x" },
            { name: "Bad", url: "not a url" },
        ],
        authors: [
            { name: "Dev", url: "https://github.com/dev-person" },
            { name: "Reddit", url: "https://reddit.com/u/someone" },
            { name: "Bad login", url: "https://github.com/-nope-/x" },
        ],
    }
    assert.deepEqual(githubLogins(credited), ["id-Software", "dev-person"])
    await resolveIssue(credited, true)
    assert.equal(calls[0].body.body, "Added: https://canitrundoom.org/?id=pub1\ncc: @id-Software @dev-person")
    const none = githubLogins({ ...entry, sourceCodeUrl: [], authors: undefined })
    assert.deepEqual(none, [])
    const many = githubLogins({ sourceCodeUrl: Array.from({ length: 9 }, (_, i) => ({ url: `https://github.com/user${i}/r` })) })
    assert.equal(many.length, 5)
})

test("rejections never mention anyone", async () => {
    const { resolveIssue, calls } = load({ GITHUB_TOKEN: "t" })
    await resolveIssue({ ...entry, sourceCodeUrl: [{ url: "https://github.com/someone/repo" }] }, false)
    assert.doesNotMatch(calls[0].body.body, /@someone/)
})
