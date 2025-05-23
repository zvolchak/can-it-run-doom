export * from "./firebaseApp"
export * from "./queries"
export * from "./bodyParsers"
export * from "./enums"

import { EItemStatus } from "../@types"
import { Request } from "express"


export function IsLocalhost(req: Request): boolean {
    const host = req.headers.host || ""
    console.info(`Request host: ${host}`)
    return host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("[::1]")
}


export function statusStringToEnum(status: string): EItemStatus {
    return Object.values(EItemStatus).includes(status as EItemStatus)
        ? (status as EItemStatus)
        : EItemStatus.published
} // statusStringToEnum
