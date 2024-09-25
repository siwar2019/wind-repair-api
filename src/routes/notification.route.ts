import { Router } from 'express'
// common
import { Paths } from '../common/paths'
import { isAuthenticated } from '../middleware/authentication'
// controllers
import { ROLES } from '../utils/constant'
import { getNotifications, updateNotifications } from '../controllers/notification.controller'

const notificationRoutes = Router()

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: APIs for Notification
 */

/**
 * @swagger
 * /notification/all:
 *   get:
 *     tags:
 *       - Notification
 *     summary: Get all Notification
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *     responses:
 *       200:
 *         description: Notification fetched successfully
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
 *               example: NOTIFICATIONS_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of notifications
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /notification/update:
 *   patch:
 *     tags:
 *       - Notification
 *     summary: Update Notification
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
 *     responses:
 *       200:
 *         description: notificationUpdated
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: NOTIFICATIONS_UPDATED
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

notificationRoutes.get(Paths.GET_ALL_NOTIFICATIONS, isAuthenticated([ROLES.CLIENT, ROLES.EMPLOYEE, ROLES.PARTNER]), getNotifications)
notificationRoutes.patch(
    Paths.UPDATE_NOTIFICATIONS,
    isAuthenticated([ROLES.CLIENT, ROLES.EMPLOYEE, ROLES.PARTNER]),
    updateNotifications
)

export default notificationRoutes
