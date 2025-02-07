import { Request, Response, Router } from 'express'

const router = Router()


router.get('/', async (req: Request, res: Response): Promise<any> => {
    return res.status(200).json([])
})


export default router
