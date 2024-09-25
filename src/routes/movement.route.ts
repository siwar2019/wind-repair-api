import { Router } from 'express'
import { Paths } from '../common/paths'
import { createMovement, getAllMovements } from '../controllers/movement.controller'
import { isAuthenticated } from '../middleware/authentication'
import { ROLES } from '../utils/constant'

const movementRoutes = Router()

/**
 * @swagger
 * tags:
 *   name: Movement
 *   description: APIs for Movement
 */

/**
 * @swagger
 * /movement/create:
 *   post:
 *     tags:
 *       - Movement
 *     summary: Create Movement
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
 *         name: value
 *         description: value
 *         required: true
 *         type: number
 *       - in: formData
 *         name: productId
 *         description: product id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: cashRegisterId
 *         description: cash register id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: movementCreadted
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: MOVEMENT_CREATED
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

/**
 * @swagger
 * /movement/all/{id}:
 *   get:
 *     tags:
 *       - Movement
 *     summary: Get all movements
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
 *         name: id
 *         description: ID of the cash register
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: movement fetched successfully
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
 *               example: MOVEMENT_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of movements
 *       500:
 *         description: Internal server error
 */

movementRoutes.post(Paths.CREATE_MOVEMENT, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), createMovement)

movementRoutes.get(Paths.GET_ALL_MOVEMENT, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), getAllMovements)

export default movementRoutes
