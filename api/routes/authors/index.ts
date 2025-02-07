import { Router } from 'express'
import addAuthor from "./addAuthor"
import editAuthor from "./editAuthor"
import getAuthors from "./getAuthors"

const NAMESPACE = "/authors"

const router = Router()
router.use(NAMESPACE, addAuthor)
router.use(NAMESPACE, editAuthor)
router.use(NAMESPACE, getAuthors)


export default router
