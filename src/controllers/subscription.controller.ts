import { Request, Response } from 'express'
// common
import { errorServerResponse, sendApiResponse } from '../common/functions'
// models
import { MSG } from '../common/responseMessages'
import { Subscription } from '../models/subscription.model'

const getSubscriptions = async (req: Request, res: Response) => {
    try {
        const subscriptions = await Subscription.findAll({
            order: [['nbr_max_employee', 'ASC']]
        })
        return sendApiResponse(res, 200, MSG.SUBSCRIPTION_SUCCESS, subscriptions)
    } catch (error) {
        console.error(error)
        return errorServerResponse(res)
    }
}

export { getSubscriptions }
