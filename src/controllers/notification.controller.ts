import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import { errorServerResponse, sendApiResponse } from '../common/functions'
import * as yup from 'yup'
import { FindOptions, Op } from 'sequelize'
import { Notification } from '../models/notification.model'

dotenv.config()

const getNotifications = async (req: Request, res: Response) => {
    const user = req.user
    try {
        if (!user) {
            return sendApiResponse(res, 400, MSG.NO_TOKEN, null)
        }

        const currentDate = new Date()
        const oneYearAgoDate = new Date()
        oneYearAgoDate.setFullYear(oneYearAgoDate.getFullYear() - 1)

        const query: FindOptions = {
            order: [['createdAt', 'DESC']],
            where: {
                userId: user.id,
                createdAt: {
                    [Op.gte]: oneYearAgoDate,
                    [Op.lte]: currentDate
                }
            }
        }

        const notifications = await Notification.findAll(query)

        return await sendApiResponse(res, 200, MSG.NOTIFICATIONS_FETCHED_SUCC, notifications)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching payment:', error)
            return errorServerResponse(res)
        }
    }
}

const updateNotifications = async (req: Request, res: Response) => {
    const user = req.user
    try {
        if (!user) {
            return sendApiResponse(res, 400, MSG.NO_TOKEN, null)
        }

        const updateData = { status: true }
        const query = {
            where: { userId: user.id, status: false }
        }

        await Notification.update(updateData, query)

        const notifications = await Notification.findAll({ where: { userId: user.id } })

        return sendApiResponse(res, 200, MSG.NOTIFICATIONS_UPDATED_SUCC, notifications)
    } catch (error) {
        console.error('Error updating notifications:', error)
        return errorServerResponse(res)
    }
}

export { getNotifications, updateNotifications }
