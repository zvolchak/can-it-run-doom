import { Request, Response, Router } from "express"
import {
    fbAuth,
    createToken,
    verifySessionCookie,
    createSessionToken,
    clearSessionToken,
    SESSION_COOKIE_LIFESPAN,
} from "../../utils"
import { IUserAuthResponse } from "../../@types"
import { signInWithEmailAndPassword } from "firebase/auth"

const router = Router()

const ROUTE_NAMESPACE = "/login"


/* Refresh user"s token from its session token. */
router.post(`${ROUTE_NAMESPACE}/validate`, async (req: Request, res: Response):  Promise<IUserAuthResponse | any> => {
    const sessionCookie = req.cookies?.session
    if (!sessionCookie) {
        return res.status(400).json({ error: "No refresh token found!" })
    }

    try {
        const userData = await verifySessionCookie(sessionCookie)
        if (!userData)
            return res.status(401).json({ error: "Failed to verify token!" })

        const expiresOn = (userData.auth_time * 1000) + SESSION_COOKIE_LIFESPAN
        return res.status(200).json({ 
            message: "Session is valid.",
            user: { 
                id: userData.uid,
                email: userData.email,
                isVerified: userData.email_verified,
                sessionExpiresOn: new Date(expiresOn).toISOString()
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(401).json({ error: "Invalid or expired refresh token!" })
    }
}) // validate


router.post(`${ROUTE_NAMESPACE}/email_and_password`, async (req: Request, res: Response): 
    Promise<IUserAuthResponse | any> => 
{
    const { email, password } = req.body
    try {
        const userData = await signInWithEmailAndPassword(fbAuth, email, password)
        const idToken = await userData.user.getIdToken(true)
        const { expiresOn } = await createSessionToken(res, idToken)

        res.status(200).json({
            message: "User has logged in.",
            user: {
                id: userData.user.uid,
                email: userData.user.email,
                isVerified: userData.user.emailVerified,
                sessionExpiresOn: expiresOn.toISOString()
            }
        })
    } catch (error) {
        console.error("Error during login:", error)
        res.status(401).json({
            error: "Invalid email or password!",
        })
    }
})


export default router
 