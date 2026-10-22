import type { IArchiveItem } from "../@types"

/** Server-owned dates. An existing public-collection record without addedAt has
 * unknown publication history; editing/republishing must not invent a date. */
export function publicationFields(incoming: IArchiveItem, previous: IArchiveItem | null, now: IArchiveItem["createdAt"]) {
    const editable = { ...incoming }
    delete editable.publicationState
    delete editable.addedAt
    delete editable.createdAt
    delete editable.updatedAt
    return {
        ...editable,
        createdAt: previous ? previous.createdAt || null : now,
        updatedAt: now,
        addedAt: previous?.addedAt || (incoming.status === "published" && (!previous || previous.publicationState === "unpublished") ? now : null),
        ...(previous?.publicationState === "published" || incoming.status === "published"
            ? { publicationState: "published" as const }
            : !previous || previous.publicationState === "unpublished" ? { publicationState: "unpublished" as const } : {}),
    }
}

/** Only persisted Firestore timestamps are accepted; public JSON is ISO UTC/null. */
export function additionIso(value: unknown): string | null {
    try {
        const date = (value as { toDate?: () => Date })?.toDate?.()
        return date instanceof Date && Number.isFinite(date.getTime()) ? date.toISOString() : null
    } catch {
        return null
    }
}
