import { Request, Response } from 'express'
// common
import { errorServerResponse, sendApiResponse } from '../common/functions'
// models
import { MSG } from '../common/responseMessages'
import { Product } from '../models/product.model'
import { User } from '../models/user.model'
import { PRODUCT_STATUS, ROLES } from '../utils/constant'
import { Type } from '../models/type.model'
import { Op, col, fn } from 'sequelize'
import { Period } from '../interfaces/period'
import { sequelize } from '../config/db'

const getStatisticForPartner = async (req: Request, res: Response) => {
    const user = req.user
    const period = req.params.period as Period

    const periodMapping: Record<Period, number> = {
        '1d': 1,
        '7d': 7,
        '30d': 30,
        '12m': 365
    }

    if (!periodMapping[period]) {
        return sendApiResponse(res, 400, MSG.INVALID_PERIOD, null)
    }

    const days = periodMapping[period]
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    const transaction = await sequelize.transaction()
    try {
        if (!user) {
            return sendApiResponse(res, 400, MSG.NO_TOKEN, null)
        }

        const typeEmployee = await Type.findOne({ where: { name: ROLES.EMPLOYEE } })
        if (!typeEmployee) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const typeClient = await Type.findOne({ where: { name: ROLES.CLIENT } })
        if (!typeClient) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const totalProduct = await Product.count({
            where: {
                partnerId: user.tenantId || user.id,
                createdAt: { [Op.gte]: dateFrom }
            },
            transaction
        })

        const totalEmployee = await User.count({
            where: {
                tenantId: user.tenantId || user.id,
                typeId: typeEmployee.id,
                createdAt: { [Op.gte]: dateFrom }
            },
            transaction
        })

        const totalClient = await User.count({
            where: {
                tenantId: user.tenantId || user.id,
                typeId: typeClient.id,
                createdAt: { [Op.gte]: dateFrom }
            },
            transaction
        })

        const totalProductClosed = await Product.count({
            where: {
                partnerId: user.tenantId || user.id,
                status: PRODUCT_STATUS.CLOSED_SUCCESS,
                createdAt: { [Op.gte]: dateFrom }
            },
            transaction
        })

        const currentYear = new Date().getFullYear()
        const startOfYear = new Date(Date.UTC(currentYear, 0, 1))
        const endOfYear = new Date(currentYear + 1, 0, 1)

        const monthlyCounts = await Product.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'],
                [fn('COUNT', col('id')), 'totalTicket']
            ],
            where: {
                partnerId: user.tenantId || user.id,
                createdAt: {
                    [Op.gte]: startOfYear,
                    [Op.lte]: endOfYear
                }
            },
            group: [fn('DATE_FORMAT', col('createdAt'), '%Y-%m')],
            order: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'ASC']],
            transaction
        })

        const monthlyData = monthlyCounts.map((item: any) => ({
            month: item.get('month'),
            totalTicket: item.get('totalTicket')
        }))

        const monthlyTicketData = []
        for (let i = 0; i < 12; i++) {
            const foundMonth = monthlyData.find((data) => parseInt(data.month.split('-')[1], 10) === i + 1)
            monthlyTicketData.push({
                month: i + 1,
                totalTicket: foundMonth ? foundMonth.totalTicket : 0
            })
        }

        const data = {
            totalProduct,
            totalEmployee,
            totalClient,
            totalProductClosed,
            monthlyTicketData
        }

        await transaction.commit()

        return sendApiResponse(res, 200, MSG.SUBSCRIPTION_SUCCESS, data)
    } catch (error) {
        await transaction.rollback()
        console.error(error)
        return errorServerResponse(res)
    }
}

export { getStatisticForPartner }
