import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import { errorServerResponse, sendApiResponse, validateSchema } from '../common/functions'
import * as yup from 'yup'
import { CashRegister } from '../models/cashRegister.model'
import { User } from '../models/user.model'
import { Type } from '../models/type.model'
import { ROLES } from '../utils/constant'
import { FindOptions, Op } from 'sequelize'
import { Movement } from '../models/movement.model'
import { sequelize } from '../config/db'
dotenv.config()

const createCashRegisterSchema = yup.object().shape({
    initialValue: yup.number().required(),
    status: yup.boolean().required(),
    name: yup.string().required(),
    bankAccount: yup.string().required()
})

const updateCashRegisterSchema = yup.object().shape({
    initialValue: yup.number(),
    status: yup.boolean(),
    name: yup.string(),
    bankAccount: yup.string()
})

const getAllCashRegisterSchema = yup.object().shape({
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
    status: yup.string().oneOf(['true', 'false']).nullable(),
    isMain: yup.string().oneOf(['true', 'false']).nullable(),
    searchKeyword: yup.string().min(2)
})

const createCashRegister = async (req: Request, res: Response) => {
    const { initialValue, status, name, bankAccount } = req.body
    const user = req.user
    try {
        await validateSchema(createCashRegisterSchema, req.body)

        if (!user) {
            return sendApiResponse(res, 400, MSG.NO_TOKEN, null)
        }

        const existingCashRegisterName = await CashRegister.findOne({
            where: { userId: user.tenantId || user.id, name }
        })

        if (existingCashRegisterName) {
            return sendApiResponse(res, 400, MSG.CASH_RESGISTER_NAME_EXIST, null)
        }

        const newCashRegister = await CashRegister.create({
            initialValue,
            status,
            userId: user.tenantId || user.id,
            bankAccount,
            name,
            total: initialValue
        })

        return sendApiResponse(res, 200, MSG.CASH_RESGISTER_ADDED_SUCC, newCashRegister)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error create cach register:', error)
            return errorServerResponse(res)
        }
    }
}

const getAllCashRegister = async (req: Request, res: Response) => {
    const user = req.user
    const { page, itemsPerPage, status, isMain, searchKeyword } = req.query
    try {
        await validateSchema(getAllCashRegisterSchema, {
            page,
            itemsPerPage,
            status,
            isMain,
            searchKeyword
        })
        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        const type = await Type.findOne({
            where: { name: ROLES.EMPLOYEE }
        })

        if (!type) {
            return sendApiResponse(res, 400, MSG.ROLE_NOT_FOUND, null)
        }

        const initialClause = {
            userId: user.tenantId || user.id,
            ...(status && { status: status === 'true' }),
            ...(isMain && { main: isMain === 'true' }),
            ...(searchKeyword && {
                [Op.or]: [
                    {
                        name: {
                            [Op.substring]: searchKeyword
                        }
                    },
                    {
                        bankAccount: {
                            [Op.substring]: searchKeyword
                        }
                    }
                ]
            })
        }

        const query: FindOptions = {
            order: [['createdAt', 'ASC']],
            where: {
                [Op.and]: initialClause
            }
        }

        if (page && itemsPerPage) {
            query.limit = parseInt(`${itemsPerPage}`)
            query.offset = (parseInt(`${page}`) - 1) * parseInt(`${itemsPerPage}`)
        }

        const cashRegisterCountForPagination = await CashRegister.count(query)

        const cashRegisterCount = await CashRegister.count({ where: { userId: user.tenantId || user.id, main: false } })

        const employeeCount = await User.count({ where: { tenantId: user.tenantId || user.id, typeId: type.id, isDeleted: false } })

        const cashRegisters = await CashRegister.findAll(query)
        return await sendApiResponse(res, 200, MSG.CASH_RESGISTER_FETCHED_SUCC, {
            list: cashRegisters,
            page: parseInt(`${page}`),
            itemsPerPage: parseInt(`${itemsPerPage}`),
            total: cashRegisterCountForPagination,
            canAddCashRegister: employeeCount === 0 || employeeCount > cashRegisterCount
        })
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching cash register:', error)
            return errorServerResponse(res)
        }
    }
}

const updateCashRegister = async (req: Request, res: Response) => {
    const user = req.user
    const { id } = req.params
    const { initialValue, status, bankAccount, name } = req.body
    const transaction = await sequelize.transaction()
    try {
        await validateSchema(updateCashRegisterSchema, req.body)
        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const cashRegister = await CashRegister.findOne({
            where: { id }
        })

        if (!cashRegister) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        if (cashRegister.userId != (user.tenantId || user.id)) {
            return sendApiResponse(res, 403, MSG.FORBIDDEN, null)
        }

        if (name && name !== cashRegister.name) {
            const existingCashRegisterName = await CashRegister.findOne({
                where: { userId: user.tenantId || user.id, name }
            })

            if (existingCashRegisterName) {
                return sendApiResponse(res, 400, MSG.CASH_RESGISTER_NAME_EXIST, null)
            }
        }

        if (!status && cashRegister.status !== status) {
            const mainCashRegister = await CashRegister.findOne({ where: { userId: user.tenantId || user.id, main: true } })
            if (mainCashRegister) {
                mainCashRegister.total = mainCashRegister.total + (cashRegister.total - cashRegister.initialValue)
                await mainCashRegister.save({ transaction })

                await Movement.create(
                    {
                        mainCashRegisterId: mainCashRegister.id,
                        cashRegisterId: cashRegister.id,
                        value: cashRegister.total - cashRegister.initialValue
                    },
                    { transaction }
                )

                cashRegister.total = cashRegister.initialValue
                await cashRegister.save({ transaction })
            }
        }

        const updatedCashRegister = await cashRegister.update(
            {
                initialValue,
                status,
                bankAccount,
                name
            },
            { transaction }
        )

        await transaction.commit()

        return sendApiResponse(res, 200, MSG.CASH_RESGISTER_UPDATED, updatedCashRegister)
    } catch (error) {
        await transaction.rollback()
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error deleting cash register:', error)
            return errorServerResponse(res)
        }
    }
}

const deleteCashRegister = async (req: Request, res: Response) => {
    const user = req.user
    const { id } = req.params
    try {
        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const cashRegister = await CashRegister.findOne({
            where: { id }
        })

        if (!cashRegister) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        if (cashRegister.userId != (user.tenantId || user.id)) {
            return sendApiResponse(res, 403, MSG.UNAUTHORIZED, null)
        }

        if (cashRegister.main) {
            return sendApiResponse(res, 403, MSG.UNABLE_TO_DELETE_MAIN_CASH_REGISTER, null)
        }

        await cashRegister.destroy()

        return sendApiResponse(res, 200, MSG.CASH_RESGISTER_DELETED_SUCC, null)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error deleting cash register:', error)
            return errorServerResponse(res)
        }
    }
}

export { createCashRegister, getAllCashRegister, updateCashRegister, deleteCashRegister }
