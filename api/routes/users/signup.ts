import { Request, Response, Router } from "express"
import { 
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from "firebase/auth"
import {
    fbAuth,
} from "../../utils"
import { 
    IUserAuthResponse,
} from "../../@types"
const router = Router()

const ROUTE_NAMESPACE = "/signup"


router.post(`${ROUTE_NAMESPACE}/email_and_password`, async (req: Request, res: Response): Promise<IUserAuthResponse | any> => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required!" })
    }

    try {
        const userData = await createUserWithEmailAndPassword(fbAuth, email.trim(), password.trim())
        await sendEmailVerification(userData.user)
        // await fbAuthAdmin.setCustomUserClaims(userData.user.uid, { role: UserRole.User })

        const idToken = await userData.user.getIdToken()

        res.status(201).json({
            message: "User signed up with email and password.",
            user: {
                id: userData.user.uid,
                email: userData.user.email,
                accessToken: idToken
            }
        })
    } catch (error) {
        console.error("Error signing up with email and password!", error)
        res.status(500).json({ error: error.message })
    }
}) // signup/email_and_password


export default router
