import axios from "axios"
import { IArchiveItem } from "../@types"

const secrets = process.env

const ISSUE_HTML_URL = /^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/issues\/(\d+)$/
const DISCORD_MAX_CONTENT = 2000


/** Issues and Discord posts go out from every deployed environment, never from local development. */
export function notificationsEnabled(): boolean {
    return secrets.NODE_ENV !== "development"
} // notificationsEnabled


/** The issue's web address (html_url) isn't an API endpoint; this maps it to its REST address. */
export function githubApiIssueUrl(htmlUrl: unknown): string | null {
    const match = typeof htmlUrl === "string" ? ISSUE_HTML_URL.exec(htmlUrl) : null
    return match ? `https://api.github.com/repos/${match[1]}/issues/${match[2]}` : null
} // githubApiIssueUrl


export function announcementText(entry: IArchiveItem): string {
    const entryUrl = `https://canitrundoom.org/?id=${entry.id}`
    return `${entry.title}:\n${entryUrl}`
} // announcementText


/** Comments on and closes the submission's issue: "completed" if approved, "not planned" if rejected. */
export async function resolveIssue(entry: IArchiveItem, approved: boolean): Promise<boolean> {
    const issueUrl = githubApiIssueUrl(entry?.requestUrl)
    if (!issueUrl)
        return false

    const token = secrets.GITHUB_TOKEN
    if (!token) {
        console.warn(`Missing github token to resolve an issue for entry ${entry?.id}`)
        return false
    }

    const body = approved
        ? announcementText(entry)
        : "This entry has been rejected. If reason will not be provided " +
            "shortly, please reach out to support or leave comments here."
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    try {
        await axios.post(`${issueUrl}/comments`, { body }, { headers })
        await axios.patch(issueUrl, {
            state: "closed",
            state_reason: approved ? "completed" : "not_planned",
        }, { headers })
    } catch (error) {
        console.error(`Failed to resolve the issue for entry ${entry.id} (${entry.requestUrl}):`, error?.message)
        return false
    }
    return true
} // resolveIssue


export async function sendDiscordNotification(entry: IArchiveItem): Promise<boolean> {
    const webhook = secrets.DISCORD_ENTRY_NOTIFY_WEBHOOK
    if (!webhook)
        return false

    try {
        await axios.post(webhook, {
            content: announcementText(entry).slice(0, DISCORD_MAX_CONTENT),
            // Titles are user-written: never let them ping @everyone, roles or users.
            allowed_mentions: { parse: [] },
        })
    } catch (error) {
        console.error(`Failed to send the discord notification for entry ${entry.id}:`, error?.message)
        return false
    }
    return true
} // sendDiscordNotification
