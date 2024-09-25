import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import * as yup from 'yup'
import { buildDynamicWhereClause, errorServerResponse, sendApiResponse, sendEmail, validateSchema } from '../common/functions'
import { User } from '../models/user.model'
import { FindOptions, Op } from 'sequelize'
import { EmailBody } from '../interfaces/emailBody'
import { SubjectEmail } from '../utils/constant'
import { ParsedQs } from 'qs'
dotenv.config()

const updateEmployeeSchema = yup.object().shape({
    isActive: yup.boolean().required()
})

const getAllPartnersSchema = yup.object({
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
    searchKeyword: yup.string().min(2),
    filters: yup
        .object()
        .shape({
            isActive: yup.boolean().nullable()
        })
        .nullable()
})

const getAllPartners = async (req: Request, res: Response) => {
    const { page, itemsPerPage, searchKeyword } = req.query
    const filters = req.query.filters as ParsedQs
    try {
        await validateSchema(getAllPartnersSchema, {
            page,
            itemsPerPage,
            searchKeyword
        })

        const initialClause = { tenantId: null, isDeleted: false }

        const dynamicWhereClause = buildDynamicWhereClause(filters, initialClause)

        const whereClauses = [dynamicWhereClause]

        if (searchKeyword) {
            whereClauses.push({
                [Op.or]: [
                    {
                        companyName: {
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

        const total = await User.count(countQuery)

        const query: FindOptions = {
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['password', 'resetToken'] },
            where: {
                [Op.and]: whereClauses
            }
        }

        if (page && itemsPerPage) {
            query.limit = parseInt(`${itemsPerPage}`)
            query.offset = (parseInt(`${page}`) - 1) * parseInt(`${itemsPerPage}`)
        }

        const partners = await User.findAll(query)

        const message = partners.length
            ? searchKeyword
                ? MSG.FILTERED_PARTNERS_FETCHED_SUCC
                : MSG.PARTNERS_FETCHED_SUCC
            : searchKeyword
            ? MSG.NO_FILTERED_PARTNERS_LIST
            : MSG.NO_PARTNERS_LIST

        return await sendApiResponse(res, 200, message, {
            list: partners,
            page: parseInt(`${page}`),
            itemsPerPage: parseInt(`${itemsPerPage}`),
            total
        })
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching partners:', error)
            return errorServerResponse(res)
        }
    }
}

const deletePartner = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const partner = await User.findOne({ where: { id } })

        if (!partner) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        await partner.destroy()

        return sendApiResponse(res, 200, MSG.PARTNER_DELETED_SUCC, null)
    } catch (error) {
        console.error('Error deleting partner:', error)
        return errorServerResponse(res)
    }
}

const updatePartner = async (req: Request, res: Response) => {
    const { id } = req.params
    const { isActive } = req.body
    try {
        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        await validateSchema(updateEmployeeSchema, req.body)
        let existingUser = await User.findOne({ where: { id } })

        if (!existingUser) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        if (isActive && existingUser.isActive !== isActive) {
            const dataEmail: EmailBody = {
                name: existingUser.companyName,
                email: existingUser.email
            }
            const emailSent = await sendEmail(dataEmail, SubjectEmail.ACTIVE)
            if (!emailSent) {
                return sendApiResponse(res, 400, MSG.EMAIL_NOT_SENT, null)
            }
        }

        const updatedPartner = await existingUser.update({
            isActive
        })

        const data = updatedPartner.toJSON()
        delete data.password
        delete data.resetToken

        return sendApiResponse(res, 200, MSG.PARTNER_UPDATED_SUCC, data)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error updating partner:', error)
            return errorServerResponse(res)
        }
    }
}

export { getAllPartners, deletePartner, updatePartner }
