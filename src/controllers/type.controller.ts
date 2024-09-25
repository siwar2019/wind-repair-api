import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import { errorServerResponse, sendApiResponse, validateSchema } from '../common/functions'
import * as yup from 'yup'
import { Type } from '../models/type.model'
dotenv.config()

const createTypeSchema = yup.object().shape({
    name: yup.string().required()
})

const createType = async (req: Request, res: Response) => {
    const { name } = req.body
    try {
        await validateSchema(createTypeSchema, req.body)

        const newType = await Type.create({
            name
        })

        return sendApiResponse(res, 200, MSG.TYPE_ADDED_SUCC, newType)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            if (error instanceof yup.ValidationError) {
                return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
            } else {
                console.error('Error create type:', error)
                return errorServerResponse(res)
            }
        }
    }
}

export { createType }
