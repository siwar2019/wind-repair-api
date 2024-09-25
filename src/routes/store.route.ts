import { Router } from 'express'
// common
import { Paths } from '../common/paths'
import { isAuthenticated } from '../middleware/authentication'
import { ROLES } from '../utils/constant'
// controllers
import { createStore, getDetailsStore, getStores } from '../controllers/store.controller'

const storeRoutes = Router()

/**
 * @swagger
 * tags:
 *   name: Store
 *   description: APIs for Store
 */

/**
 * @swagger
 * /store/create-store:
 *   post:
 *     tags:
 *       - Store
 *     summary: Create a new store with sub-stores
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *       - in: body
 *         name: stores
 *         description: Store data for creation
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             stores:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   storeName:
 *                     type: string
 *                     description: Name of the store
 *                     example: "Main Store"
 *                   nbrLines:
 *                     type: number
 *                     description: Number of lines
 *                     example: 1
 *                   columns:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Array of columns
 *                     example: ["A"]
 *                   subStores:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         subStoreName:
 *                           type: string
 *                           description: Name of subStore
 *                           example: "A1"
 *           example:
 *             stores:
 *               - storeName: "Main Store"
 *                 nbrLines: 1
 *                 columns: ["A"]
 *                 subStores:
 *                   - subStoreName: "A1"
 *                   - subStoreName: "A2"
 *     responses:
 *       200:
 *         description: Store created successfully
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
 *               example: "STORE_ADDED_SUCC"
 *             data:
 *               type: array
 *               description: Empty array or created data
 *               example: []
 *       400:
 *         description: Data missing
 *         examples:
 *           application/json:
 *             error: true
 *             data: null
 *             message: "DATA_MISSING"
 *       500:
 *         description: Internal server error
 *         examples:
 *           application/json:
 *             error: true
 *             data: null
 *             message: "SERVER_ERROR"
 */

storeRoutes.post(Paths.CREATE_STORE, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), createStore)
storeRoutes.get(Paths.GET_ALL_STORES, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), getStores)
storeRoutes.get(Paths.GET_STORE_DETAILS, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), getDetailsStore)

export default storeRoutes
