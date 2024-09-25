import { Router } from 'express'
// common
import { Paths } from '../common/paths'
import { isAuthenticated } from '../middleware/authentication'
// controllers
import { ROLES } from '../utils/constant'
import { generateQrImage, getAllPayment, getPartnerPayment, getStatusQrCode } from '../controllers/payment.controller'

const paymentRoutes = Router()

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: APIs for Payment
 */

/**
 * @swagger
 * /payment/all:
 *   get:
 *     tags:
 *       - Payment
 *     summary: Get all payments
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
 *         description: payments fetched successfully
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
 *               example: PAYMENTS_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of payments
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * definitions:
 *   PaymentData:
 *     type: object
 *     properties:
 *       qrCode:
 *         type: string
 *         example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *         description: Base64 encoded image data representing the QR code.
 */

/**
 * @swagger
 * /payment/generate-qr-image:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Generate qr image for payment
 *     description: Generate qr image for payment
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: amount
 *         type: string
 *         required: true
 *         description: amount
 *         default: 100
 *     responses:
 *       200:
 *         description: qrCode created successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "qrCode created successfully"
 *             data:
 *               $ref: '#/definitions/PaymentData'
 *       400:
 *         description: Invalid request or missing data
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /payment/status/{codePay}:
 *   get:
 *     tags:
 *       - Payment
 *     summary: get status payment
 *     description: get status payment
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: codePay
 *         description: code pay
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: status fetched successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "status fetched successfully"
 *               data: []
 *
 *       400:
 *         description: Invalid request or missing data
 *       500:
 *         description: Internal server error
 */

paymentRoutes.get(Paths.GET_ALL_PAYMENT, isAuthenticated([ROLES.ADMIN]), getAllPayment)

paymentRoutes.post(Paths.GENERATE_QR_IMAGE, generateQrImage)

paymentRoutes.get(Paths.GET_STATUS, getStatusQrCode)

paymentRoutes.get(Paths.GET_PARTNER_PAYMENTS, isAuthenticated([ROLES.ADMIN]), getPartnerPayment)

export default paymentRoutes
