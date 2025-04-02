import { Request, Response, NextFunction, } from "express"
import { DecodedIdToken } from "firebase-admin/auth"
import {
    verifySessionCookie,
} from "../utils"
import {
    UserRole,
    IsAuthorized,
    IsLocalhost,
} from "../utils"


async function getUserClaim(req: Request, res: Response): Promise<DecodedIdToken> {
    const sessionCookie = req.cookies.session || null
    const claim = await verifySessionCookie(sessionCookie)
    if (!claim) {
        throw new Error("Failed to verifySessionCookie!")
    }

    return claim
} // authenticateByRole


export async function authenticate(req: Request, res: Response, next: NextFunction) {
    if (IsLocalhost(req) && process.env.NODE_ENV === "development") {
        req.user = { uid: "test ", role: UserRole.Moderator } as any
        next()
        return
    }

    try {
        const claim = await getUserClaim(req, res)
        req.user = claim

        next()
    } catch (error) {
        console.error("Session cookie verification failed: ", error)
        res.status(401).json({ "error": "Failed to authenticate!" })
    }
} // authenticate


export async function authorizeByRole(
    req: Request, 
    res: Response, 
    targetRole: UserRole, 
    next: NextFunction
) {
    if (IsLocalhost(req) && process.env.NODE_ENV === "development") {
        next()
        return
    }
    
    try {
        const isAuthorized = IsAuthorized(
            req?.user?.role?.toLocaleLowerCase(), 
            targetRole
        )

        const isOwner = process.env.FB_ROOT_UID?.split(",").indexOf(req.user.uid) >= 0
        if (!isAuthorized && !isOwner)
            throw new Error("Access denied!")

        next()
    } catch (error) {
        console.error("Session cookie verification failed: ", error)
        res.status(401).json({ "error": "Unauthorized access!" })
    }
}
