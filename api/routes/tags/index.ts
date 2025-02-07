import { Router } from 'express'
import getTags from "./getTags"

const NAMESPACE = "/tags"

const router = Router()
router.use(NAMESPACE, getTags)


export default router
