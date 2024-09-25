import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import { checkPartnerProduct, errorServerResponse, sendApiResponse, validateSchema } from '../common/functions'
import * as yup from 'yup'
import { RepairTicket } from '../models/repairTicket.model'
import { Product } from '../models/product.model'
import { FindOptions } from 'sequelize'
import { User } from '../models/user.model'
import { Part } from '../models/part.model'
import { HistoryProduct } from '../models/historyProduct'
dotenv.config()

const updateTicketSchema = yup.object().shape({
    payed: yup.boolean(),
    endDate: yup.date(),
    estimatedCost: yup.number(),
    totalCost: yup.number(),
    estimatedTime: yup.number(),
    description: yup.string()
})

const getAllTicketsSchema = yup.object().shape({
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

    itemsPerPage: yup.number().min(1).integer().positive().nullable()
})

const updateTicket = async (req: Request, res: Response) => {
    const { id } = req.params
    const { payed, endDate, estimatedCost, totalCost, estimatedTime, description } = req.body
    const user = req.user
    try {
        await validateSchema(updateTicketSchema, req.body)

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const ticket = await RepairTicket.findOne({
            where: { id },
            include: [
                {
                    model: Product,
                    as: 'product'
                }
            ]
        })

        if (!ticket) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const isPartner = checkPartnerProduct(user, ticket.product.partnerId)

        if (!isPartner) {
            return sendApiResponse(res, 401, MSG.UNAUTHORIZED, null)
        }

        const updatedTicket = await ticket.update({
            payed,
            endDate,
            estimatedCost,
            totalCost,
            estimatedTime,
            description
        })

        return sendApiResponse(res, 200, MSG.TICKET_UPDATED, updatedTicket)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            if (error instanceof yup.ValidationError) {
                return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
            } else {
                console.error('Error updating ticket:', error)
                return errorServerResponse(res)
            }
        }
    }
}

const deleteTicket = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = req.user
    try {
        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const ticket = await RepairTicket.findOne({
            where: { id },
            include: [
                {
                    model: Product,
                    as: 'product'
                }
            ]
        })

        if (!ticket) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const isPartner = checkPartnerProduct(user, ticket.product.partnerId)

        if (!isPartner) {
            return sendApiResponse(res, 401, MSG.UNAUTHORIZED, null)
        }

        await ticket.destroy()

        return sendApiResponse(res, 200, MSG.TICKET_DELETED_SUCC, null)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error deleting ticket:', error)
            return errorServerResponse(res)
        }
    }
}

const getAllTicket = async (req: Request, res: Response) => {
    const user = req.user
    const { page, itemsPerPage } = req.query
    try {
        await validateSchema(getAllTicketsSchema, {
            page,
            itemsPerPage
        })

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        const query: FindOptions = {
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Product,
                    as: 'product'
                }
            ]
        }

        const ticketsCount = await RepairTicket.findAll(query)

        const filteredTicketsCount = ticketsCount.filter((ticket) => {
            return checkPartnerProduct(user, ticket.product.partnerId)
        })

        const totalCount = filteredTicketsCount.length

        if (page && itemsPerPage) {
            query.limit = parseInt(`${itemsPerPage}`)
            query.offset = (parseInt(`${page}`) - 1) * parseInt(`${itemsPerPage}`)
        }

        const tickets = await RepairTicket.findAll(query)

        const filteredTickets = tickets.filter((ticket) => {
            return checkPartnerProduct(user, ticket.product.partnerId)
        })

        return await sendApiResponse(res, 200, MSG.TICKETS_FETCHED_SUCC, {
            list: filteredTickets,
            page: parseInt(`${page}`),
            itemsPerPage: parseInt(`${itemsPerPage}`),
            total: totalCount
        })
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching tickets:', error)
            return errorServerResponse(res)
        }
    }
}

const getProductTickets = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = req.user
    try {
        await validateSchema(getAllTicketsSchema, req.body)

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const product = await Product.findOne({ where: { id } })
        if (!product) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const isPartner = checkPartnerProduct(user, product.partnerId)

        if (!isPartner) {
            return sendApiResponse(res, 403, MSG.UNAUTHORIZED, null)
        }

        const tickets = await RepairTicket.findAll({ where: { productId: id } })

        return sendApiResponse(res, 200, MSG.TICKETS_FETCHED_SUCC, tickets)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching product ticket:', error)
            return errorServerResponse(res)
        }
    }
}

const getDetailsTickets = async (req: Request, res: Response) => {
    const { uuid } = req.params
    try {
        if (!uuid) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const ticket = await RepairTicket.findOne({
            where: { code: uuid },
            include: [
                {
                    model: Product,
                    as: 'product',
                    include: [
                        {
                            model: User,
                            as: 'client',
                            attributes: { exclude: ['password', 'resetToken'] }
                        },
                        {
                            model: Part,
                            as: 'parts'
                        },
                        {
                            model: HistoryProduct,
                            as: 'history'
                        }
                    ]
                }
            ]
        })

        if (!ticket) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        return sendApiResponse(res, 200, MSG.TICKET_FETCHED_SUCC, ticket)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching ticket:', error)
            return errorServerResponse(res)
        }
    }
}

export { updateTicket, deleteTicket, getAllTicket, getProductTickets, getDetailsTickets }
