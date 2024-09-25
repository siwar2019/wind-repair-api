import { Router } from 'express'
// common
import { Paths } from '../common/paths'
import { deletePartner, getAllPartners, updatePartner } from '../controllers/partner.controller'
import { isAuthenticated } from '../middleware/authentication'
import { ROLES } from '../utils/constant'
// controllers

const partnerRoutes = Router()

/**
 * @swagger
 * /partner/all-partners:
 *   get:
 *     tags:
 *       - Partner
 *     summary: Get all partner
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
 *         description: "Page of partners list (optional)"
 *         required: false
 *         type: integer
 *       - in: query
 *         name: itemsPerPage
 *         description: "item per page (optional)"
 *         type: integer
 *       - in: formData
 *         name: searchKeyword
 *         type: string
 *         required: false
 *         description: searched word "name" (optional)
 *     responses:
 *       200:
 *         description: Partners fetched successfully
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
 *               example: PARTNERS_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of partners
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /partner/delete-partner/{id}:
 *   delete:
 *     tags:
 *       - Partner
 *     summary: Delete an existing partner by ID
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
 *         description: ID of the partner to delete
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Partner deleted successfully
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
 *               example: PARTNER_DELETED_SUCC
 *       404:
 *         description: partner not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /partner/update-partner/{id}:
 *   patch:
 *     tags:
 *       - Partner
 *     summary: Update partner
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
 *         name: isActive
 *         description: isActive
 *         type: boolean
 *     responses:
 *       200:
 *         description: partnerUpdated
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: PARTNER_UPDATED
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

partnerRoutes.get(Paths.GET_ALL_PARTNERS, isAuthenticated([ROLES.ADMIN]), getAllPartners)

partnerRoutes.delete(Paths.DELETE_PARTNER, isAuthenticated([ROLES.ADMIN]), deletePartner)

partnerRoutes.patch(Paths.UPDATE_PARTNER, isAuthenticated([ROLES.ADMIN]), updatePartner)

export default partnerRoutes
