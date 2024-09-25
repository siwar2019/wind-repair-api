import { Router } from 'express'
import { Paths } from '../common/paths'
import { getStatisticForPartner } from '../controllers/statistic.controller'
import { isAuthenticated } from '../middleware/authentication'
import { ROLES } from '../utils/constant'

const statisticRoutes = Router()

/**
 * @swagger
 * tags:
 *   name:  Statistic
 *   description: APIs for Statistic
 */

/**
 * @swagger
 * /statistic/all/{period}:
 *   get:
 *     tags:
 *       - Statistic
 *     summary: Get all statistic
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *       - in: path
 *         name: period
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Statistic fetched successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               description: Indicates if the request was successful
 *               example: true
 *             message:
 *               type: string
 *               description: Message indicating success
 *               example: STATISTIC_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of statistic
 *       500:
 *         description: Internal server error
 */

statisticRoutes.get(Paths.GET_STATISTIC, isAuthenticated([ROLES.PARTNER]), getStatisticForPartner)

export default statisticRoutes
