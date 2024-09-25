import { Router } from 'express'
import { Paths } from '../common/paths'
import { isAuthenticated } from '../middleware/authentication'
import { ROLES } from '../utils/constant'
import { deleteTicket, getAllTicket, getDetailsTickets, getProductTickets, updateTicket } from '../controllers/ticket.controller'

const ticketRoutes = Router()

/**
 * @swagger
 * tags:
 *   name:  Ticket
 *   description: APIs for Ticket
 */

/**
 * @swagger
 * /ticket/update-ticket/{id}:
 *   patch:
 *     tags:
 *       - Ticket
 *     summary: Update ticket
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
 *         name: payed
 *         description: payed
 *         type: boolean
 *       - in: formData
 *         name: startDate
 *         description: startDate
 *         type: date
 *       - in: formData
 *         name: endDate
 *         description: endDate
 *         type: date
 *       - in: formData
 *         name: estimatedCost
 *         description: estimatedCost
 *         type: number
 *       - in: formData
 *         name: totalCost
 *         description: totalCost
 *         type: number
 *       - in: formData
 *         name: estimatedTime
 *         description: estimatedTime
 *         type: number
 *       - in: formData
 *         name: description
 *         description: description
 *         type: string
 *     responses:
 *       200:
 *         description: ticketUpdated
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: TICKET_UPDATED
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
 * /ticket/delete-ticket/{id}:
 *   delete:
 *     tags:
 *       - Ticket
 *     summary: Delete an existing ticket by ID
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
 *         description: ID of the ticket to delete
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: ticket deleted successfully
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
 *               example: TICKET_DELETED_SUCC
 *       404:
 *         description: ticket not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /ticket/all-tickets:
 *   get:
 *     tags:
 *       - Ticket
 *     summary: Get all tickets
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
 *         description: "Page of tickets list (optional)"
 *         required: false
 *         type: integer
 *       - in: query
 *         name: itemsPerPage
 *         description: "item per page (optional)"
 *         required: false
 *         type: integer
 *     responses:
 *       200:
 *         description: Tickets fetched successfully
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
 *               example: TICKETS_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of tickets
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /ticket/all-product-tickets/{id}:
 *   get:
 *     tags:
 *       - Ticket
 *     summary: Get all tickets
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
 *         description: ID of the product
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Tickets fetched successfully
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
 *               example: TICKETS_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of tickets
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /ticket/details-ticket/{uuid}:
 *   get:
 *     tags:
 *       - Ticket
 *     summary: Get details ticket
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: uuid
 *         description: UUID of the ticket
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Ticket fetched successfully
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
 *               example: TICKET_FETCHED_SUCC
 *             data:
 *               type: object
 *               description: ticket data
 *       500:
 *         description: Internal server error
 */

ticketRoutes.patch(Paths.UPDATE_TICKET, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), updateTicket)

ticketRoutes.delete(Paths.DELETE_TICKET, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), deleteTicket)

ticketRoutes.get(Paths.GET_ALL_TICKETS, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), getAllTicket)

ticketRoutes.get(Paths.GET_ALL_PRODUCT_TICKETS, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), getProductTickets)

ticketRoutes.get(Paths.GET_DEATILS_TICKET, getDetailsTickets)

export default ticketRoutes
