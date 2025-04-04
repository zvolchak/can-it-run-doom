import { Router } from 'express'
import getEntries from "./getEntries"
import editEntry from "./editEntry"
import addEntries from "./addEntries"
import reviewEntries from "./reviewEntries"

const NAMESPACE = "/doom_ports"

const router = Router()
router.use(NAMESPACE, getEntries)
router.use(NAMESPACE, addEntries)
router.use(NAMESPACE, editEntry)
router.use(NAMESPACE, reviewEntries)

export default router
