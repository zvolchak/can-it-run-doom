import { Timestamp } from "firebase/firestore"
import {
    IArchiveItem,
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
    if (typeof(incomingTags) === "string")
        result = incomingTags.split(",")
    else
        result = [...incomingTags]

    return result.map(i => i.trim())
} // normalizeTagsValues


export function buildArchiveItem(incoming: any): IArchiveItem {
    if (!incoming)
        return {}

    const item: IArchiveItem = {
        title: incoming.title || "",
        description: incoming.description || "",
        authors: jsonParseString(incoming.authors) || null,
        sourcesUrl: jsonParseString(incoming.sourcesUrl) || null,
        sourceCodeUrl: jsonParseString(incoming.sourceCodeUrl) || null,
        isFirstLevelComplete: Boolean(incoming.isFirstLevelComplete || false),
        publishDate: incoming.publishDate ? Timestamp.fromDate(new Date(incoming.publishDate)) : null,
        tags: normalizeTagsValues(incoming.tags) || null,
        previewImg: incoming.previewImg || null,

        isPublished: Boolean(incoming.isPublished || false),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        submittedBy: incoming.uid || null,
    }

    return item
} // buildArchiveItem
