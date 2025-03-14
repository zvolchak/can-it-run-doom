export * from "./firebaseApp"
export * from "./queries"
export * from "./bodyParsers"
export * from "./enums"

import { Request } from "express"


export function IsLocalhost(req: Request): boolean {
    const host = req.headers.host || ""
    return host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("[::1]")
}
