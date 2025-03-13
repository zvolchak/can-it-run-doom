import { DecodedIdToken } from "firebase-admin/auth"

declare global {
    namespace Express {
        export interface Request {
            user?: DecodedIdToken // Add user property to Request object
        }
    }
}
