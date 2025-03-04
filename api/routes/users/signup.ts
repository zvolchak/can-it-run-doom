import { Request, Response, Router } from "express"
import { 
    // signInAnonymously, 
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from "firebase/auth"
import {
    fbAuth,
    fbAuthAdmin,
    UserRole,
    // createSessionToken,
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
        const userData = await createUserWithEmailAndPassword(fbAuth, email, password)
        await sendEmailVerification(userData.user)
        await fbAuthAdmin.setCustomUserClaims(userData.user.uid, { role: UserRole.User })

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


// router.post(`${ROUTE_NAMESPACE}/guest`, async (req: Request, res: Response):  Promise<IUserAuthResponse | any> => {
//     let accessToken = null
//     let guest = null
//     try {
//         guest = await signInAnonymously(fbAuth)
//         accessToken = await guest.user.getIdToken(true)
//         await createSessionToken(res, accessToken)
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({ error: "Failed to sign in as guest!"})
//     }

//     return res.status(200).json({ 
//         message: "Signed in as guest.", 
//         user: {
//             id: guest.user.uid,
//             accessToken: accessToken,
//         }
//     })
// })


export default router
