import { Request, Response } from 'express'
import {
    sendApiResponse,
    errorServerResponse,
    validateSchema,
    checkPartnerProduct,
    generateStatusChangeMessage,
    buildDynamicWhereClause
} from '../common/functions'
import { MSG } from '../common/responseMessages'
import * as yup from 'yup'
import { User } from '../models/user.model'
import bcrypt from 'bcrypt'
import { NotificationPriority, NotificationType, PAYMENT_METHOD, PRODUCT_STATUS, ROLES } from '../utils/constant'
import { Product } from '../models/product.model'
import { v4 as uuidv4 } from 'uuid'
import { Type } from '../models/type.model'
import { RepairTicket } from '../models/repairTicket.model'
import { FindOptions, Op } from 'sequelize'
import { sequelize } from '../config/db'
import { Part } from '../models/part.model'
import { HistoryProduct } from '../models/historyProduct'
import { io, userSocketMap } from '../../app'
import { Notification } from '../models/notification.model'
import { format } from 'date-fns'
import { Invoice } from '../models/invoice.model'
import { ParsedQs } from 'qs'
import { SubStore } from '../models/subStore.model'
import { Store } from '../models/store.model'

const partSchema = yup.object().shape({
    name: yup.string().required(),
    category: yup.string(),
    price: yup.number().required(),
    garantie: yup.number()
})

const createProductSchema = yup.object().shape({
    serialNumber: yup.string().required(),
    name: yup.string(),
    model: yup.string().required(),
    problemDescription: yup.string().required(),
    subStoreId: yup.number(),
    pin: yup.string(),
    dateFinWarranty: yup.date(),

    customerName: yup.string().required(),
    email: yup.string(),
    phone: yup.string().required(),
    password: yup.string().required(),

    estimatedCost: yup.number().required(),
    estimatedTime: yup.number(),

    parts: yup.array().of(partSchema)
})

const updateProductSchema = yup.object().shape({
    serialNumber: yup.string(),
    name: yup.string(),
    model: yup.string(),
    problemDescription: yup.string(),
    status: yup.string(),
    subStoreId: yup.number(),
    closedDescriptionReason: yup.string(),

    estimatedCost: yup.number(),
    estimatedTime: yup.number(),
    totalCost: yup.number(),
    payed: yup.boolean(),
    parts: yup.array().of(partSchema),
    idsDeleted: yup.array().of(yup.number())
})

const assignProductSchema = yup.object().shape({
    isAssigned: yup.boolean().required()
})

const getAllProductsSchema = yup.object().shape({
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
    searchKeyword: yup.string().min(2).nullable(),
    filters: yup
        .object()
        .shape({
            status: yup
                .array()
                .of(yup.string().oneOf(Object.values(PRODUCT_STATUS)))
                .nullable()
        })
        .nullable()
})

const createProduct = async (req: Request, res: Response) => {
    const {
        serialNumber,
        name,
        model,
        problemDescription,
        customerName,
        phone,
        email,
        password,
        estimatedCost,
        estimatedTime,
        description,
        subStoreId,
        pin,
        parts,
        dateFinWarranty
    } = req.body

    const user = req.user

    const t = await sequelize.transaction()

    try {
        await validateSchema(createProductSchema, req.body)

        if (!user) {
            throw new Error(MSG.NO_TOKEN)
        }

        const partnerId = user.tenantId || user.id

        const type = await Type.findOne({
            where: { name: ROLES.CLIENT }
        })

        if (!type) {
            throw new Error(MSG.NOT_FOUND)
        }
        const client = await User.findOne({
            where: {
                phone
            }
        })

        const code = uuidv4()
        let clientId

        if (client) {
            if (client.typeId !== type.id) {
                throw new Error(MSG.USER_ALREADY_EXIST)
            } else {
                clientId = client.id
            }
        } else {
            if (email) {
                const existingUserWithEmail = await User.findOne({
                    where: { email }
                })

                if (existingUserWithEmail) {
                    throw new Error(MSG.EMAIL_ALREADY_EXISTS)
                }
            }

            const newClient = await User.create(
                {
                    name: customerName,
                    phone,
                    email,
                    tenantId: partnerId,
                    password: bcrypt.hashSync(password, 10),
                    typeId: type.id,
                    isActive: true
                },
                { transaction: t }
            )
            clientId = newClient.id
        }

        const newProduct = await Product.create(
            {
                serialNumber,
                name,
                model,
                problemDescription,
                subStoreId,
                clientId: clientId,
                partnerId: partnerId,
                status: PRODUCT_STATUS.PENDING,
                pin,
                dateFinWarranty
            },
            { transaction: t }
        )

        await HistoryProduct.create(
            {
                status: newProduct.status,
                productId: newProduct.id
            },
            { transaction: t }
        )

        if (parts) {
            const partCreationPromises = parts.map((part: Part) =>
                Part.create(
                    {
                        name: part.name,
                        category: part.category,
                        price: part.price,
                        garantie: part.garantie,
                        productId: newProduct.id
                    },
                    { transaction: t }
                )
            )
            await Promise.all(partCreationPromises)
        }

        const currentDate = new Date()

        const endDate = new Date(currentDate)
        endDate.setDate(endDate.getDate() + estimatedTime)

        await RepairTicket.create(
            {
                estimatedCost,
                estimatedTime,
                totalCost: estimatedCost,
                description,
                productId: newProduct.id,
                code,
                startDate: currentDate,
                endDate: endDate
            },
            { transaction: t }
        )

        await t.commit()

        const product = await Product.findOne({
            where: { id: newProduct.id },
            include: [
                { model: RepairTicket, as: 'repairticket' },
                {
                    model: User,
                    as: 'client',
                    attributes: { exclude: ['password', 'resetToken'] }
                },
                { model: Part, as: 'parts' }
            ]
        })

        return sendApiResponse(res, 200, MSG.PRODUCT_CREATED, product)
    } catch (error: any) {
        if (
            error.message === MSG.NO_TOKEN ||
            error.message === MSG.NOT_FOUND ||
            error.message === MSG.TOKEN_ERROR ||
            error.message === MSG.DATA_MISSING ||
            error.message === MSG.EMAIL_ALREADY_EXISTS ||
            error.message === MSG.PHONE_ALREADY_EXISTS ||
            error.message === MSG.SETTING_NOT_FOUND ||
            error.message === MSG.USER_ALREADY_EXIST
        ) {
            return sendApiResponse(res, 400, error.message, null)
        } else {
            console.error('Error creating product:', error)
            return errorServerResponse(res)
        }
    }
}

const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params
    const {
        serialNumber,
        name,
        model,
        problemDescription,
        status,
        estimatedCost,
        estimatedTime,
        totalCost,
        payed,
        subStoreId,
        closedDescriptionReason,

        parts,
        idsDeleted
    } = req.body
    const user = req.user
    const transaction = await sequelize.transaction()
    try {
        await validateSchema(updateProductSchema, req.body)

        if (!user) {
            await transaction.rollback()
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            await transaction.rollback()
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        let existingProduct = await Product.findOne({ where: { id } })

        if (!existingProduct) {
            await transaction.rollback()
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        let existingRepairTicket = await RepairTicket.findOne({ where: { productId: existingProduct.id } })

        if (!existingRepairTicket) {
            await transaction.rollback()
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const isPartner = checkPartnerProduct(user, existingProduct.partnerId)

        if (!isPartner) {
            await transaction.rollback()
            return sendApiResponse(res, 401, MSG.UNAUTHORIZED, null)
        }

        if (status !== existingProduct.status) {
            await HistoryProduct.create(
                {
                    status,
                    productId: existingProduct.id
                },
                { transaction }
            )

            const messageEn = generateStatusChangeMessage(status, existingProduct.status, 'en')
            const messageFr = generateStatusChangeMessage(status, existingProduct.status, 'fr')

            const newNotifications = await Notification.create(
                {
                    messageEn,
                    messageFr,
                    userId: existingProduct.clientId,
                    type: NotificationType.INFO,
                    periority: NotificationPriority.HIGH
                },
                { transaction }
            )

            const existingNotification = await Notification.findAll({
                where: {
                    userId: existingProduct.clientId,
                    status: false
                },
                order: [['createdAt', 'DESC']]
            })

            const notificationData = existingNotification.map((notification) => notification.dataValues)

            const allNotifications = newNotifications ? [newNotifications.dataValues, ...notificationData] : notificationData

            const socketId = userSocketMap.get(existingProduct.clientId)
            if (socketId) {
                io.to(socketId).emit('product_status_updated', allNotifications)
            }
            if (status === PRODUCT_STATUS.CLOSED_SUCCESS) {
                const timestamp = format(new Date(), 'yyyyMMddHHmmss')
                const trimmedTimestamp = timestamp.slice(2, -4)
                const randomValues = Math.floor(100 + Math.random() * 900)
                    .toString()
                    .slice(0, 2)
                const numInvoice = `FACT-${trimmedTimestamp}${randomValues}`

                await Invoice.create({
                    num: numInvoice,
                    total: existingRepairTicket.totalCost,
                    status: false,
                    paymentMethode: PAYMENT_METHOD.CASH,
                    ticketId: existingRepairTicket.id
                })
            }
        }

        if (estimatedTime && existingRepairTicket.estimatedTime !== estimatedTime) {
            const startDate = existingRepairTicket.startDate

            if (startDate) {
                const endDate = new Date(startDate)
                endDate.setDate(endDate.getDate() + estimatedTime)

                existingRepairTicket.endDate = endDate
                await existingRepairTicket.save({ transaction })
            }
        }

        await existingProduct.update(
            {
                serialNumber,
                name,
                model,
                problemDescription,
                status,
                subStoreId,
                closedDescriptionReason
            },
            { transaction }
        )

        await RepairTicket.update(
            {
                estimatedCost,
                estimatedTime,
                totalCost,
                payed
            },

            { where: { productId: id }, transaction }
        )

        if (idsDeleted && idsDeleted.length > 0) {
            await Part.destroy({ where: { id: idsDeleted, productId: id }, transaction })
        }

        if (parts) {
            const partsUpdate = parts.map(async (part: Part) => {
                if (part.id) {
                    const existingPart = await Part.findOne({ where: { id: part.id, productId: id } })
                    if (existingPart) {
                        return existingPart.update(
                            {
                                name: part.name,
                                category: part.category,
                                price: part.price,
                                garantie: part.garantie
                            },
                            { transaction }
                        )
                    }
                }
                return Part.create(
                    {
                        name: part.name,
                        category: part.category,
                        price: part.price,
                        garantie: part.garantie,
                        productId: id
                    },
                    { transaction }
                )
            })
            await Promise.all(partsUpdate)
        }

        await transaction.commit()

        const updatedProduct = await Product.findOne({
            where: { id },
            include: [
                {
                    model: RepairTicket,
                    as: 'repairticket'
                },
                {
                    model: User,
                    as: 'client',
                    attributes: { exclude: ['password', 'resetToken'] }
                },
                { model: Part, as: 'parts' }
            ]
        })

        return sendApiResponse(res, 200, MSG.PRODUCT_UPDATED, updatedProduct)
    } catch (error) {
        await transaction.rollback()
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error updating product:', error)
            return errorServerResponse(res)
        }
    }
}

const assignProduct = async (req: Request, res: Response) => {
    const user = req.user
    const { id } = req.params
    const { isAssigned, employeeId } = req.body
    try {
        await validateSchema(assignProductSchema, req.body)
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
            return sendApiResponse(res, 401, MSG.UNAUTHORIZED, null)
        }

        const checkEmployee = await User.findAll({ where: { id: employeeId } })
        if (!checkEmployee) {
            return sendApiResponse(res, 400, MSG.EMPLOYEE_NOT_FOUND, null)
        }

        const isPartnerRole = await User.findAll({ where: { typeId: 1 } })
        if (!employeeId && !isPartnerRole) {
            product.employeeId = isAssigned ? user.id : null
            product.status = isAssigned ? product.status : PRODUCT_STATUS.PENDING
        } else {
            product.employeeId = isAssigned ? employeeId : null
            product.status = isAssigned ? product.status : PRODUCT_STATUS.PENDING
        }
        await product.save()

        return sendApiResponse(res, 200, MSG.PRODUCT_ASSIGNED, product)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error assign product:', error)
            return errorServerResponse(res)
        }
    }
}

const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = req.user
    try {
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
            return sendApiResponse(res, 401, MSG.UNAUTHORIZED, null)
        }

        await product.destroy()

        return sendApiResponse(res, 200, MSG.PRODUCT_DELETED_SUCC, null)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error deleting product:', error)
            return errorServerResponse(res)
        }
    }
}

const getAllProduct = async (req: Request, res: Response) => {
    const { page, itemsPerPage, searchKeyword } = req.query
    const user = req.user
    const filters = req.query.filters as ParsedQs
    try {
        await validateSchema(getAllProductsSchema, {
            page,
            itemsPerPage,
            searchKeyword,
            filters
        })

        if (!user) {
            return sendApiResponse(res, 400, MSG.NO_TOKEN, null)
        }

        const whereClause = {
            partnerId: user.tenantId || user.id
        }

        const type = await Type.findOne({
            where: { id: user.typeId }
        })
        if (!type) {
            return sendApiResponse(res, 400, MSG.ROLE_NOT_FOUND, null)
        }

        let dynamicWhereClause = buildDynamicWhereClause(filters, whereClause)

        if (type.name === ROLES.CLIENT) {
            dynamicWhereClause.clientId = user.id
        } else if (type.name === ROLES.EMPLOYEE) {
            dynamicWhereClause = {
                ...whereClause,
                [Op.or]: [{ employeeId: user.id }, { employeeId: null }]
            }
        }

        const whereClauses = [dynamicWhereClause]

        if (searchKeyword) {
            whereClauses.push({
                [Op.or]: [
                    {
                        name: {
                            [Op.substring]: searchKeyword
                        }
                    },
                    {
                        serialNumber: {
                            [Op.substring]: searchKeyword
                        }
                    },
                    {
                        model: {
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

        const total = await Product.count(countQuery)

        const query: FindOptions = {
            order: [['createdAt', 'DESC']],
            where: {
                [Op.and]: whereClauses
            },
            include: [
                {
                    model: User,
                    as: 'client',
                    attributes: { exclude: ['password', 'resetToken'] }
                },

                {
                    model: RepairTicket,
                    as: 'repairticket'
                },
                {
                    model: Part,
                    as: 'parts'
                },
                {
                    model: HistoryProduct,
                    as: 'history'
                },
                {
                    model: SubStore,
                    as: 'subStore',
                    include: [{ model: Store, as: 'store', attributes: ['name', 'id'] }]
                }
            ]
        }

        if (page && itemsPerPage) {
            query.limit = parseInt(`${itemsPerPage}`)
            query.offset = (parseInt(`${page}`) - 1) * parseInt(`${itemsPerPage}`)
        }

        const products = await Product.findAll(query)

        const message = products.length
            ? searchKeyword
                ? MSG.FILTERED_PRODUCTS_FETCHED_SUCC
                : MSG.PRODUCTS_FETCHED_SUCC
            : searchKeyword
            ? MSG.NO_FILTERED_PRODUCTS_LIST
            : MSG.NO_PRODUCTS_LIST

        return await sendApiResponse(res, 200, message, {
            list: products,
            page: parseInt(`${page}`),
            itemsPerPage: parseInt(`${itemsPerPage}`),
            total
        })
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching products:', error)
            return errorServerResponse(res)
        }
    }
}

const getProduct = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = req.user

    try {
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
            return sendApiResponse(res, 401, MSG.UNAUTHORIZED, null)
        }

        return sendApiResponse(res, 200, MSG.PRODUCT_FETCHED_SUCC, product)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching product:', error)
            return errorServerResponse(res)
        }
    }
}

export { createProduct, updateProduct, assignProduct, deleteProduct, getAllProduct, getProduct }
