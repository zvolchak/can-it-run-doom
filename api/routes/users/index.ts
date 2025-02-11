import { Router } from 'express'
import signupRoute from "./signup"
import loginRoute from "./login"

const NAMESPACE = "/user"

const router = Router()
router.use(NAMESPACE, signupRoute)
router.use(NAMESPACE, loginRoute)

export default router
