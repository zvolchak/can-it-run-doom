import { NextRouter } from "next/router"


export function redirectToEntries(router: NextRouter, query = {}) {
    const params: any = { pathname: "/entries", }
    if (query) {
        params.query = query
    }
    
    router.push(params)
} // redirectToEntries
