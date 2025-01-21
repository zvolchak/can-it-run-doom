export * from "./itemsFilters"


export function IsProd() {
    return ["production", "prod"].indexOf(process.env.NODE_ENV.toLocaleLowerCase()) >= 0
}


export function isUseComma(items: Array<any>, index: number) {
    return items?.length > 1 && index < items?.length - 1
}


export const paginate = (target: Array<any>, currentPage: number, itemsPerPage: number): any => {
    const result = [ ...target ]
    if (currentPage < 0 ) currentPage = 0
  
    const start = (itemsPerPage * currentPage)
    return result.splice(start, itemsPerPage)
  } // paginate
  