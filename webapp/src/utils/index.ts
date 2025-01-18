export * from "./itemsFilters"

export function isUseComma(items: Array<any>, index: number) {
    return items?.length > 1 && index < items?.length - 1
}
