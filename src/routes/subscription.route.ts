import { Router } from 'express'
// common
import { Paths } from '../common/paths'
// controllers
import { getSubscriptions } from '../controllers/subscription.controller'

const subscriptionRoutes = Router()

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: APIs for Subscription
 */

/**
 * @swagger
 * /subscription/get-subscriptions:
 *   get:
 *     tags:
 *       - Subscription
 *     summary: Get subscriptions
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
 *         description: subscription data retrieved successfully
 *         examples:
 *           application/json:
 *             data:
 *               - id: "1"
 *                 nbrMaxEmployee: 10
 *                 price: 20
 *             success: true
 *             message: SUBSCRIPTION_SUCCESS
 *       500:
 *         description: Internal server error
 *         examples:
 *           application/json:
 *             error: true
 *             data: null
 *             message: SERVER_ERROR
 */

subscriptionRoutes.get(Paths.GET_ALL_SUBSCRIPTIONS, getSubscriptions)

export default subscriptionRoutes
