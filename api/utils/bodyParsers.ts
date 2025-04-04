import { Timestamp } from "firebase/firestore"
import { DecodedIdToken } from "firebase-admin/auth"
import {
    IArchiveItem,
    EItemStatus,
} from "../@types"

/*
 * Parse an incoming value with JSON parse if its a string. Otherwise - return incoming as is.
 * This is useful when dealing with request body, where a nested variable could be an array
 * that is passed in as string.
 */ 
export function jsonParseString(incoming: string | any) {
    if (!incoming)
        return incoming

    try {
        return JSON.parse(incoming)
    } catch {
        return incoming
    }
} // jsonParseString


export function normalizeTagsValues(incomingTags: string | string[]) {
    let result = []
    try {
        if (typeof(incomingTags) === "string")
            result = incomingTags.split(",")
        else
            result = [...incomingTags]
    } catch (error) {
        console.error(`Failed to parse tags: ${incomingTags}`, error)
        return []
    }
    return result.map(i => i.trim())
} // normalizeTagsValues


export async function buildArchiveItem(
    incoming: any[],
    user: DecodedIdToken,
): Promise<IArchiveItem[]> {
    if (!incoming)
        return []

    if (typeof(incoming) === "string")
        incoming = jsonParseString(incoming)

    const items = await Promise.all(incoming.map(async (item) => {
        return {
            id: item.id,
            title: item.title || "",
            description: item.description || "",
            authors: jsonParseString(item.authors) || null,
            sourcesUrl: jsonParseString(item.sourcesUrl) || null,
            sourceCodeUrl: jsonParseString(item.sourceCodeUrl) || null,
            isFirstLevelComplete: Boolean(item.isFirstLevelComplete || false),
            publishDate: item.publishDate ? Timestamp.fromDate(new Date(item.publishDate)) : null,
            tags: normalizeTagsValues(item.tags) || null,
            previewImg: item.previewImg || null,
            status: item.status || EItemStatus.pending,
            // isPublished: Boolean(item.isPublished || false),
            createdBy: user.uid || null,
            updatedBy: user?.uid ? [user.uid] : [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            submittedBy: item.uid || null,
        } as IArchiveItem
    }))
    return items
} // buildArchiveItem
