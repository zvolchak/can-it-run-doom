import { Request, Response, Router } from "express"
import {
    fbAuth,
    createToken,
    verifySessionCookie,
    createSessionToken,
} from "../../utils"
import { IUserAuthResponse } from "../../@types"
import { signInWithEmailAndPassword } from "firebase/auth"

const router = Router()

const ROUTE_NAMESPACE = "/login"


/* Refresh user"s token from its session token. */
router.post(`${ROUTE_NAMESPACE}/`, async (req: Request, res: Response):  Promise<IUserAuthResponse | any> => {
    const sessionCookie = req.cookies?.session
    if (!sessionCookie) {
        return res.status(400).json({ error: "No refresh token found!" })
    }

    try {
        const userData = await verifySessionCookie(sessionCookie)
        if (!userData)
            return res.status(401).json({ error: "Failed to verify token!" })

        const newAccessToken = await createToken(userData.uid)
        if (!newAccessToken)
            return res.status(401).json({ error: "Failed to create a new token!" })

        res.status(200).json({ 
            message: "Session has been updated.", 
            user: { 
                id: userData.uid, 
                accessToken: newAccessToken,
                isVerified: userData.email_verified,
            }
        })
    } catch (error) {
        console.debug(error)
        return res.status(401).json({ error: "Invalid or expired refresh token!" })
    }
}) // login


router.post(`${ROUTE_NAMESPACE}/email_and_password`, async (req: Request, res: Response): Promise<IUserAuthResponse | any> => {
    const { email, password } = req.body
    try {
        const userData = await signInWithEmailAndPassword(fbAuth, email, password)
        const idToken = await userData.user.getIdToken()
        await createSessionToken(res, idToken)

        res.status(200).json({
            message: "User has logged in.",
            user: {
                id: userData.user.uid,
                accessToken: idToken,
                email: userData.user.email,
                isVerified: userData.user.emailVerified,
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
