export type TagCategory = "device" | "system" | "software" | "engine" | "technique" | "input" | "display"

export interface ITag {
    id: string
    label: string
    category: TagCategory
    description?: string
}
