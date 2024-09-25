import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import { errorServerResponse, sendApiResponse, validateSchema } from '../common/functions'
import * as yup from 'yup'
import { Movement } from '../models/movement.model'
import { CashRegister } from '../models/cashRegister.model'
import { Product } from '../models/product.model'
import { FindOptions, Op } from 'sequelize'
import { RepairTicket } from '../models/repairTicket.model'
import { User } from '../models/user.model'
import { Invoice } from '../models/invoice.model'
import { sequelize } from '../config/db'
dotenv.config()

const createMovementSchema = yup.object().shape({
    value: yup.number().required(),
    cashRegisterId: yup.number().required(),
    invoiceId: yup.number().required()
})

const getAllMovementSchema = yup.object().shape({
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

const createMovement = async (req: Request, res: Response) => {
    const { value, cashRegisterId, invoiceId } = req.body
    const user = req.user
    const transaction = await sequelize.transaction()
    try {
        await validateSchema(createMovementSchema, req.body)

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        const cashRegister = await CashRegister.findOne({ where: { id: cashRegisterId } })
        if (!cashRegister) {
            await transaction.rollback()
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        if (cashRegister.userId !== (user.tenantId || user.id)) {
            await transaction.rollback()
            return sendApiResponse(res, 401, MSG.UNAUTHORIZED, null)
        }

        const invoice = await Invoice.findOne({
            where: { id: invoiceId },
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
            await transaction.rollback()
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        invoice.status = true
        await invoice.save({ transaction })

        const newMovement = await Movement.create(
            {
                value,
                cashRegisterId,
                productId: invoice.repairTicket.product.id
            },
            { transaction }
        )

        cashRegister.total = cashRegister.total + value
        await cashRegister.save({ transaction })

        await transaction.commit()

        return sendApiResponse(res, 200, MSG.CASH_RESGISTER_ADDED_SUCC, newMovement)
    } catch (error) {
        await transaction.rollback()
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error create movement:', error)
            return errorServerResponse(res)
        }
    }
}

const getAllMovements = async (req: Request, res: Response) => {
    const user = req.user
    const { page, itemsPerPage } = req.query
    const { id } = req.params
    try {
        await validateSchema(getAllMovementSchema, {
            page,
            itemsPerPage
        })

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            return sendApiResponse(res, 404, MSG.INVALID_ID, null)
        }

        const cashRegister = await CashRegister.findOne({
            where: { id }
        })

        if (!cashRegister) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const query: FindOptions = {
            order: [['createdAt', 'DESC']],
            where: {
                [Op.and]: [cashRegister.main ? { mainCashRegisterId: id } : { cashRegisterId: id, mainCashRegisterId: null }].filter(
                    Boolean
                )
            },
            include: [
                {
                    model: CashRegister,
                    as: 'cashRegister'
                },
                {
                    model: CashRegister,
                    as: 'mainCashRegister'
                },
                {
                    model: Product,
                    as: 'product',
                    include: [
                        {
                            model: RepairTicket,
                            as: 'repairticket'
                        },
                        {
                            model: User,
                            as: 'client',
                            attributes: { exclude: ['password', 'resetToken'] }
                        }
                    ]
                }
            ]
        }

        if (page && itemsPerPage) {
            query.limit = parseInt(`${itemsPerPage}`)
            query.offset = (parseInt(`${page}`) - 1) * parseInt(`${itemsPerPage}`)
        }

        const movementCount = await Movement.count({
            where: { cashRegisterId: id }
        })

        const movements = await Movement.findAll(query)

        return await sendApiResponse(res, 200, MSG.MOVEMENTS_FETCHED_SUCC, {
            list: movements,
            page: parseInt(`${page}`),
            itemsPerPage: parseInt(`${itemsPerPage}`),
            total: movementCount,
            isMain: cashRegister.main,
            amountTotal: cashRegister.total
        })
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching movement:', error)
            return errorServerResponse(res)
        }
    }
}

export { createMovement, getAllMovements }
