import { Router } from 'express'
// common
import { Paths } from '../common/paths'
import { forgotPassword, login, register, resetPassword } from '../controllers/auth.controller'
import { verifyTokenReset } from '../middleware/authentication'
// controllers

const authRoutes = Router()

/**
 * @swagger
 * tags:
 *   name:  Auth
 *   description: APIs for Auth
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: login
 *         description: email or phone
 *         required: true
 *         type: string
 *       - in: formData
 *         name: password
 *         description: password
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Logged in
 *         examples:
 *           application/json:
 *             data: null
 *             token: token
 *             success: true
 *             message: LOGGED_IN
 *       400:
 *         description: Data missing or wrong credentials
 *         examples:
 *           application/json:
 *             error: true
 *             data: null
 *             message: DATA_MISSING or WRONG_CREDENTIALS
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
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: email
 *         description: email
 *         required: true
 *         type: string
 *       - in: formData
 *         name: password
 *         description: password
 *         required: true
 *         type: string
 *       - in: formData
 *         name: companyName
 *         description: company name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: phone
 *         description: phone
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: partnerAddedSuccessfully
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: PARTNER_ADDED_SUCC
 *       400:
 *         description: Data missing or email already exists
 *         examples:
 *           application/json:
 *             error: true
 *             data: null
 *             message: DATA_MISSING or EMAIL_ALREADY_EXISTS
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
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Forgot password
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: email
 *         description: email of the user
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Email sent
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: EMAIL_SENT
 *       400:
 *         description: Data missing or email not sent
 *         examples:
 *           application/json:
 *             error: true
 *             data: null
 *             message: DATA_MISSING or EMAIL_NOT_SENT
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
 * /auth/reset-password:
 *   patch:
 *     tags:
 *       - Auth
 *     summary: Reset password
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: password
 *         description: new password
 *         required: true
 *         type: string
 *       - in: formData
 *         name: resetToken
 *         description: reset token
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: password updated successfully
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: PASS_UPDATE_SUCC
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
authRoutes.post(Paths.LOGIN, login)
authRoutes.post(Paths.REGISTER, register)
authRoutes.post(Paths.FORGOT_PASSWORD, forgotPassword)
authRoutes.post(Paths.RESET_PASSWORD, verifyTokenReset, resetPassword)

export default authRoutes
