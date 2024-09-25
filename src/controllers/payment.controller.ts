import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import { buildDynamicWhereClause, errorServerResponse, sendApiResponse, validateSchema } from '../common/functions'
import * as yup from 'yup'
import { User } from '../models/user.model'
import { FindOptions, Op } from 'sequelize'
import axios from 'axios'
import qr from 'qrcode'
import { Paths } from '../common/paths'
import { SubscriptionPayment } from '../models/subscriptionPayment.model'
import { STATUS_PAYMENT, TYPE_PAYMENT } from '../utils/constant'
import { sequelize } from '../config/db'
import { Subscription } from '../models/subscription.model'
import { ParsedQs } from 'qs'
dotenv.config()

const getAllPaymentSchema = yup.object().shape({
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
            type: yup
                .array()
                .of(yup.string().oneOf(Object.values(TYPE_PAYMENT)))
                .nullable(),
            payed: yup.boolean().nullable()
        })
        .nullable()
})

const generateQrImageSchema = yup.object().shape({
    amount: yup.number().required(),
    username: yup.string().required()
})

const getAllPayment = async (req: Request, res: Response) => {
    const { page, itemsPerPage } = req.query
    const filters = req.query.filters as ParsedQs
    try {
        await validateSchema(getAllPaymentSchema, {
            page,
            itemsPerPage,
            filters
        })

        const dynamicWhereClause = buildDynamicWhereClause(filters)

        const whereClauses = [dynamicWhereClause]

        const countQuery: FindOptions = {
            where: {
                [Op.and]: whereClauses
            }
        }

        const total = await SubscriptionPayment.count(countQuery)

        const query: FindOptions = {
            order: [['createdAt', 'DESC']],
            where: {
                [Op.and]: whereClauses
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password', 'resetToken'] }
                },
                {
                    model: Subscription,
                    as: 'subscription'
                }
            ]
        }

        if (page && itemsPerPage) {
            query.limit = parseInt(`${itemsPerPage}`)
            query.offset = (parseInt(`${page}`) - 1) * parseInt(`${itemsPerPage}`)
        }

        const payments = await SubscriptionPayment.findAll(query)

        return await sendApiResponse(res, 200, MSG.PAYMENT_FETCHED_SUCC, {
            list: payments,
            page: parseInt(`${page}`),
            itemsPerPage: parseInt(`${itemsPerPage}`),
            total
        })
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching payment:', error)
            return errorServerResponse(res)
        }
    }
}

const getPartnerPayment = async (req: Request, res: Response) => {
    const { page, itemsPerPage } = req.query
    const { id } = req.params
    try {
        await validateSchema(getAllPaymentSchema, {
            page,
            itemsPerPage
        })

        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const query: FindOptions = {
            order: [['createdAt', 'DESC']],
            where: { userId: id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password', 'resetToken'] }
                }
            ]
        }

        if (page && itemsPerPage) {
            query.limit = parseInt(`${itemsPerPage}`)
            query.offset = (parseInt(`${page}`) - 1) * parseInt(`${itemsPerPage}`)
        }

        const paymentCount = await SubscriptionPayment.count({ where: { userId: id } })

        const payments = await SubscriptionPayment.findAll(query)

        return await sendApiResponse(res, 200, MSG.PAYMENT_FETCHED_SUCC, {
            list: payments,
            page: parseInt(`${page}`),
            itemsPerPage: parseInt(`${itemsPerPage}`),
            total: paymentCount
        })
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching payment:', error)
            return errorServerResponse(res)
        }
    }
}

const getAuthToken = async (res: Response) => {
    try {
        const authData = {
            username: process.env.PAYMENT_USERNAME,
            password: process.env.PAYMENT_PASSWORD
        }

        const authResponse = await axios.post(process.env.PAYMENT_API + Paths.AUTHENTICATE, authData)

        const authToken = authResponse?.data?.id_token
        if (!authToken) {
            return sendApiResponse(res, 400, MSG.TOKEN_ERROR, null)
        }

        return authToken
    } catch (error) {
        return errorServerResponse(res)
    }
}

const generateQrImage = async (req: Request, res: Response) => {
    const { amount, username } = req.body
    const authToken = await getAuthToken(res)

    try {
        await validateSchema(generateQrImageSchema, req.body)
        const headers = {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }

        const requestData = {
            merchantCode: process.env.MERCHANT_CODE,
            amount: amount
        }

        const response = await axios.patch(process.env.PAYMENT_API + Paths.QR_CODE_GENERATE, requestData, {
            headers: headers
        })
        const codePay = response?.data?.codePay
        const qrCode = response?.data?.qrCode

        if (!codePay) {
            return sendApiResponse(res, 400, MSG.QR_CODE_ERROR, null)
        }

        const user = await User.findOne({
            where: {
                [Op.or]: [{ email: username }, { phone: username }]
            }
        })

        if (!user) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const payment = await SubscriptionPayment.findOne({ where: { userId: user.id }, order: [['createdAt', 'DESC']] })
        if (!payment) {
            return sendApiResponse(res, 400, MSG.NOT_FOUND, null)
        }
        const currentDate = new Date()
        const endDate = new Date(payment.endDate)

        if (payment.type === TYPE_PAYMENT.free && currentDate > endDate) {
            payment.codePay = codePay
            payment.type = TYPE_PAYMENT.standard
        }

        if (payment.type === TYPE_PAYMENT.standard && currentDate > endDate && payment.payed) {
            await SubscriptionPayment.create({
                userId: user.id,
                type: TYPE_PAYMENT.standard,
                startDate: currentDate,
                endDate: endDate,
                subscriptionId: payment.subscriptionId,
                nbrEmploye: payment.nbrEmployee,
                payed: false,
                codePay
            })
        } else {
            payment.codePay = codePay
        }

        await payment.save()

        const qrCodeImage = await qr.toDataURL(qrCode)

        return sendApiResponse(res, 200, MSG.QR_CODE_SUCCESS, {
            codePay,
            qrCodeImage
        })
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            return errorServerResponse(res)
        }
    }
}

const getStatusQrCode = async (req: Request, res: Response) => {
    const { codePay } = req.params
    const authToken = await getAuthToken(res)
    const transaction = await sequelize.transaction()
    try {
        if (!codePay) {
            return sendApiResponse(res, 400, MSG.INVALID_CODE_PAY, null)
        }

        const headers = {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }

        const response = await axios.get(`${process.env.PAYMENT_API}${Paths.GET_STATUS_QR_CODE}/${codePay}`, {
            headers: headers
        })

        const currentDate = new Date()
        const endDate = new Date(currentDate)
        endDate.setFullYear(currentDate.getFullYear() + 1)

        if (response.data === STATUS_PAYMENT.PAID) {
            const payment = await SubscriptionPayment.findOne({
                where: { codePay, payed: false, type: TYPE_PAYMENT.standard },
                order: [['createdAt', 'DESC']]
            })

            if (payment) {
                await payment.update({ payed: true, startDate: currentDate, endDate: endDate, codePay }, { transaction })
                await User.update({ isActive: true }, { where: { id: payment.userId }, transaction })
            }
        }

        await transaction.commit()

        return sendApiResponse(res, 200, MSG.STATUS_FETCHED_SUCC, response.data)
    } catch (error) {
        await transaction.rollback()
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            return errorServerResponse(res)
        }
    }
}

export { getAllPayment, getAuthToken, generateQrImage, getStatusQrCode, getPartnerPayment }
