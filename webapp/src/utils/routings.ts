import { NextRouter } from "next/router"


export function redirectToEntries(router: NextRouter, key: string = null, value: string = null) {
    const params: any = { pathname: "/entries", }
    if (key) {
        params.query = {}
        params.query[key] = value
    }
    
    router.push(params)
} // redirectToEntries
