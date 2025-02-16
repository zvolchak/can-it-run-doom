import { Router, Request, Response, } from 'express'
import { rateLimit } from 'express-rate-limit'
import signupRoute from "./signup"
import loginRoute from "./login"
import {
    clearSessionToken,
} from "../../utils"

const NAMESPACE = "/user"
const router = Router()

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: "Too many requests. Try again in 15 minutes."
})

router.post(
    `${NAMESPACE}/signout`,
    async (req: Request, res: Response): Promise<any> => {
    try {
        clearSessionToken(res)

        res.status(200).json({ message: "User has been logged out." })
    } catch (error) {
        console.error("Error during logout:", error)
        res.status(500).json({ error: "Failed to log out!" })
    }
})


router.use(NAMESPACE, signupRoute)
router.use(NAMESPACE, loginRoute)

export default router
