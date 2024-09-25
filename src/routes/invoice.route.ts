import { Router } from 'express'
import { Paths } from '../common/paths'
import { ROLES } from '../utils/constant'
import { deleteInvoice, getAllInvoices, updateInvoice } from '../controllers/invoice.controller'
import { isAuthenticated } from '../middleware/authentication'

const invoiceRoutes = Router()

/**
 * @swagger
 * tags:
 *   name:  Invoice
 *   description: APIs for Invoice
 */

/**
 * @swagger
 * /invoice/create-invoice:
 *   post:
 *     tags:
 *       - Invoice
 *     summary: Create Invoice
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
 *         name: date
 *         description: date
 *         required: true
 *         type: date
 *       - in: formData
 *         name: tax
 *         description: tax
 *         type: number
 *       - in: formData
 *         name: discount
 *         description: discount
 *         type: number
 *       - in: formData
 *         name: total
 *         description: total
 *         required: true
 *         type: number
 *       - in: formData
 *         name: notes
 *         description: notes
 *         type: string
 *       - in: formData
 *         name: paymentMethode
 *         description: paymentMethode
 *         required: true
 *         type: string
 *       - in: formData
 *         name: idTicket
 *         description: id Ticket
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: invoiceCreadted
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: INVOICE_CREATED
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
 * /invoice/all-invoices:
 *   get:
 *     tags:
 *       - Invoice
 *     summary: Get all invoices
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
 *         description: "Page of invoices list (optional)"
 *         required: false
 *         type: integer
 *       - in: query
 *         name: itemsPerPage
 *         description: "item per page (optional)"
 *         required: false
 *         type: integer
 *     responses:
 *       200:
 *         description: Invoices fetched successfully
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
 *               example: INVOICES_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of invoices
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /invoice/update-invoice/{id}:
 *   patch:
 *     tags:
 *       - Invoice
 *     summary: Update invoice
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
 *         name: date
 *         description: date
 *         required: true
 *         type: date
 *       - in: formData
 *         name: tax
 *         description: tax
 *         type: number
 *       - in: formData
 *         name: discount
 *         description: discount
 *         type: number
 *       - in: formData
 *         name: total
 *         description: total
 *         required: true
 *         type: number
 *       - in: formData
 *         name: notes
 *         description: notes
 *         type: string
 *       - in: formData
 *         name: paymentMethode
 *         description: paymentMethode
 *         required: true
 *         type: string
 *       - in: formData
 *         name: status
 *         description: status
 *         required: true
 *         type: boolean
 *     responses:
 *       200:
 *         description: invoiceUpdated
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: INVOICE_UPDATED
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
 * /invoice/delete-invoice/{id}:
 *   delete:
 *     tags:
 *       - Invoice
 *     summary: Delete an existing invoice by ID
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
 *         description: ID of the invoice to delete
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: invoice deleted successfully
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
 *               example: INVOICE_DELETED_SUCC
 *       404:
 *         description: invoice not found
 *       500:
 *         description: Internal server error
 */

invoiceRoutes.get(Paths.GET_ALL_INVOICES, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), getAllInvoices)

invoiceRoutes.patch(Paths.UPDATE_INVOICE, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), updateInvoice)

invoiceRoutes.delete(Paths.DELETE_INVOICE, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), deleteInvoice)

export default invoiceRoutes
