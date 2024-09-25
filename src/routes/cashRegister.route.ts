import { Router } from 'express'
// common
import { Paths } from '../common/paths'
import { isAuthenticated } from '../middleware/authentication'
// controllers
import { ROLES } from '../utils/constant'
import { createCashRegister, deleteCashRegister, getAllCashRegister, updateCashRegister } from '../controllers/cashRegister.controller'

const cashRegisterRoutes = Router()

/**
 * @swagger
 * tags:
 *   name: CashRegister
 *   description: APIs for Cash register
 */

/**
 * @swagger
 * /cash-register/create:
 *   post:
 *     tags:
 *       - CashRegister
 *     summary: Create Cash register
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
 *         name: initialValue
 *         description: initial value
 *         required: true
 *         type: number
 *       - in: formData
 *         name: status
 *         description: status
 *         required: true
 *         type: boolean
 *     responses:
 *       200:
 *         description: cashRegisterCreadted
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: CASH_REGISTER_CREATED
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
 * /cash-register/all:
 *   get:
 *     tags:
 *       - CashRegister
 *     summary: Get all cash register
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *       - in: query
 *         name: page
 *         description: "Page of cash register list (optional)"
 *         required: false
 *         type: integer
 *       - in: query
 *         name: itemsPerPage
 *         description: "item per page (optional)"
 *         required: false
 *         type: integer
 *       - in: query
 *         name: status
 *         description: status
 *         required: false
 *         type: string
 *       - in: query
 *         name: isMain
 *         description: isMain
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: cash register fetched successfully
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
 *               example: CASH_REGISTER_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of cash register
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /cash-register/update/{id}:
 *   patch:
 *     tags:
 *       - CashRegister
 *     summary: Update CashRegister
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
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: initialValue
 *         description: initial value
 *         type: number
 *       - in: formData
 *         name: status
 *         description: status
 *         type: boolean
 *     responses:
 *       200:
 *         description: cashRegisterUpdated
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: CASH_REGISTER_UPDATED
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
 * /cash-register/delete/{id}:
 *   delete:
 *     tags:
 *       - CashRegister
 *     summary: Delete an existing CashRegister by ID
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
 *         description: ID of the CashRegister to delete
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: CashRegister deleted successfully
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
 *               example: CASH_REGISTER_DELETED_SUCC
 *       404:
 *         description: CashRegister not found
 *       500:
 *         description: Internal server error
 */

cashRegisterRoutes.post(Paths.CREATE_CASH_REGISTER, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), createCashRegister)

cashRegisterRoutes.get(Paths.GET_ALL_CASH_REGISTERS, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), getAllCashRegister)

cashRegisterRoutes.patch(Paths.UPDATE_CASH_REGISTER, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), updateCashRegister)

cashRegisterRoutes.delete(Paths.DELETE_CASH_REGISTER, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), deleteCashRegister)

export default cashRegisterRoutes
