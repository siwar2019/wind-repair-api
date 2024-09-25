import { Router } from 'express'
// common
import { Paths } from '../common/paths'
import { isAuthenticated } from '../middleware/authentication'
import { ROLES } from '../utils/constant'
// controllers
import { createType } from '../controllers/type.controller'

const typeRoutes = Router()

/**
 * @swagger
 * tags:
 *   name: Type
 *   description: APIs for Type
 */

/**
 * @swagger
 * /type/create-type:
 *   post:
 *     tags:
 *       - Type
 *     summary: Create Type
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *       - in: formData
 *         name: name
 *         description: name
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: typeCreadted
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: TYPE_CREATED
 *       400:
 *         description: Data missing
 *         examples:
 *           application/json:
 *             error: true
 *             data: null
 *             message: DATA_MISSING
 *       500:
 *         description: Internal server error
 *         examples:
 *           application/json:
 *             error: true
 *             data: null
 *             message: SERVER_ERROR
 */

typeRoutes.post(Paths.CREATE_TYPE, isAuthenticated([ROLES.ADMIN]), createType)

export default typeRoutes
