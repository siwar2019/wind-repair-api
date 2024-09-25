import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import {
    buildDynamicWhereClause,
    checkPartnerProduct,
    errorServerResponse,
    sendApiResponse,
    validateSchema
} from '../common/functions'
import * as yup from 'yup'
import { Invoice } from '../models/invoice.model'
import { RepairTicket } from '../models/repairTicket.model'
import { PAYMENT_METHOD } from '../utils/constant'
import { Product } from '../models/product.model'
import { FindOptions, Op } from 'sequelize'
import { User } from '../models/user.model'
import { ParsedQs } from 'qs'
import { Part } from '../models/part.model'
dotenv.config()

const getAllInvoicesSchema = yup.object().shape({
    page: yup
        .number()
        .min(1)
        .integer()
        .positive()
        .nullable()
        .when('itemsPerPage', {
            is: (val: number | undefined) => val && val !== 0,
            then: (schema) => schema.required()
        }),

    itemsPerPage: yup.number().min(1).integer().positive().nullable(),
    filters: yup
        .object()
        .shape({
            paymentMethode: yup
                .array()
                .of(yup.string().oneOf(Object.values(PAYMENT_METHOD)))
                .nullable(),
            status: yup.boolean().nullable()
        })
        .nullable(),
    searchKeyword: yup.string().min(2)
})

const updateInvoiceSchema = yup.object().shape({
    date: yup.date(),
    tax: yup.number(),
    discount: yup.number(),
    total: yup.number(),
    notes: yup.string(),
    paymentMethode: yup.string().oneOf(Object.values(PAYMENT_METHOD)),
    status: yup.boolean()
})

const getAllInvoices = async (req: Request, res: Response) => {
    const { page, itemsPerPage, searchKeyword } = req.query
    const user = req.user
    const filters = req.query.filters as ParsedQs
    try {
        await validateSchema(getAllInvoicesSchema, {
            page,
            itemsPerPage,
            user,
            filters,
            searchKeyword
        })

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        const dynamicWhereClause = buildDynamicWhereClause(filters)

        const whereClauses = [dynamicWhereClause]

        if (searchKeyword) {
            whereClauses.push({
                [Op.or]: [
                    {
                        num: {
                            [Op.substring]: searchKeyword
                        }
                    }
                ]
            })
        }

        const countQuery: FindOptions = {
            where: {
                [Op.and]: whereClauses
            }
        }

        const total = await Invoice.count(countQuery)

        const query: FindOptions = {
            order: [['createdAt', 'DESC']],
            where: {
                [Op.and]: whereClauses
            },
            include: [
                {
                    model: RepairTicket,
                    as: 'repairTicket',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            include: [
                                {
                                    model: User,
                                    as: 'client',
                                    attributes: { exclude: ['password', 'resetToken'] },
                                    include: [
                                        {
                                            model: User,
                                            as: 'company',
                                            attributes: ['companyName', 'phone', 'email']
                                        }
                                    ]
                                },
                                {
                                    model: Part,
                                    as: 'parts'
                                }
                            ]
                        }
                    ]
                }
            ]
        }

        if (page && itemsPerPage) {
            query.limit = parseInt(`${itemsPerPage}`)
            query.offset = (parseInt(`${page}`) - 1) * parseInt(`${itemsPerPage}`)
        }

        const invoices = await Invoice.findAll(query)

        const filteredInvoices = invoices.filter((invoice) => {
            const product = invoice.repairTicket.product
            return checkPartnerProduct(user, product.partnerId)
        })

        return await sendApiResponse(res, 200, MSG.INVOICES_FETCHED_SUCC, {
            list: filteredInvoices,
            page: parseInt(`${page}`),
            itemsPerPage: parseInt(`${itemsPerPage}`),
            total
        })
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching invoices:', error)
            return errorServerResponse(res)
        }
    }
}

const updateInvoice = async (req: Request, res: Response) => {
    const { id } = req.params
    const { date, tax, discount, total, notes, paymentMethode, status } = req.body

    const user = req.user
    try {
        await validateSchema(updateInvoiceSchema, req.body)

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const existingInvoice = await Invoice.findOne({
            where: { id },
            include: [
                {
                    model: RepairTicket,
                    as: 'repairTicket',
                    include: [
                        {
                            model: Product,
                            as: 'product'
                        }
                    ]
                }
            ]
        })

        if (!existingInvoice) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const isPartner = checkPartnerProduct(user, existingInvoice.repairTicket.product.partnerId)

        if (!isPartner) {
            return sendApiResponse(res, 401, MSG.UNAUTHORIZED, null)
        }

        const updatedInvoice = await existingInvoice.update({
            date,
            tax,
            discount,
            total,
            notes,
            paymentMethode,
            status
        })

        return sendApiResponse(res, 200, MSG.INVOICE_UPDATED, updatedInvoice)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error updating invoice:', error)
            return errorServerResponse(res)
        }
    }
}

const deleteInvoice = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = req.user
    try {
        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const invoice = await Invoice.findOne({
            where: { id },
            include: [
                {
                    model: RepairTicket,
                    as: 'repairTicket',
                    include: [
                        {
                            model: Product,
                            as: 'product'
                        }
                    ]
                }
            ]
        })

        if (!invoice) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const isPartner = checkPartnerProduct(user, invoice.repairTicket.product.partnerId)

        if (!isPartner) {
            return sendApiResponse(res, 401, MSG.UNAUTHORIZED, null)
        }

        await invoice.destroy()

        return sendApiResponse(res, 200, MSG.INVOICE_DELETED_SUCC, null)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error deleting invoice:', error)
            return errorServerResponse(res)
        }
    }
}

export { getAllInvoices, updateInvoice, deleteInvoice }
