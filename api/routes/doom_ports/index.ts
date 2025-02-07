import { Router } from 'express'
import getEntries from "./getEntries"
import editEntry from "./editEntry"
import addEntries from "./addEntries"

const NAMESPACE = "/doom_ports"

const router = Router()
router.use(NAMESPACE, getEntries)
router.use(NAMESPACE, addEntries)
router.use(NAMESPACE, editEntry)

export default router
