import { Request, Response, Router } from "express"
import {
    fbAuthAdmin,
    UserAccessPriority,
    EUserRole,
} from "../../utils"
import {
    authenticate,
    authorizeByRole,
} from "../../middleware"
import { 
    IUserAuthResponse,
    ISetUserRoleBody,
} from "../../@types"

const router = Router()

const ROUTE_NAMESPACE = "/admin"


/* Refresh user"s token from its session token. */
router.post(
    `${ROUTE_NAMESPACE}/set_role`,
    authenticate,
    (req: Request, res: Response, next) => authorizeByRole(req, res, EUserRole.Owner, next),
    async (req: Request, res: Response):  Promise<IUserAuthResponse | any> => 
{
    const targets: ISetUserRoleBody[] = req.body
    const result = { success: [], failed: [] }
    await Promise.all(targets?.map(async (target: ISetUserRoleBody) => {
        if (UserAccessPriority.indexOf(target.role) < 0) {
            result.failed.push(target)
        }

        try {
            await fbAuthAdmin.setCustomUserClaims(target.uid, { role: target.role })
            result.success.push(target)
        } catch (error) {
            console.error("Failed to setCustomUserClaims: ", error)
            result.failed.push(target)
        }
    }))

    return res.status(200).json(result)
}) // validate


export default router
 