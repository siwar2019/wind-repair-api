import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import {
    buildDynamicWhereClause,
    errorServerResponse,
    generateRandomPassword,
    sendApiResponse,
    sendEmail,
    validateSchema
} from '../common/functions'
import bcrypt from 'bcrypt'
import * as yup from 'yup'
import { ROLES, ROLES_USER, SubjectEmail } from '../utils/constant'
import { User } from '../models/user.model'
import { EmailBody } from '../interfaces/emailBody'
import { Role } from '../models/role.model'
import { Type } from '../models/type.model'
import { FindOptions, Op } from 'sequelize'
import { UserRole } from '../models/userRole.model'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { ParsedQs } from 'qs'
import { getPartnerWithEmail } from './settings.controller'
dotenv.config()

const createEmployeeSchema = yup.object().shape({
    email: yup.string().email().required(),
    name: yup.string().required(),
    phone: yup.string().min(8).max(8).required(),
    roleId: yup.number().required()
})

const getAllUsersSchema = yup.object().shape({
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
    typeUser: yup.string().oneOf(Object.values(ROLES_USER)).required(),
    filters: yup
        .object()
        .shape({
            isActive: yup.boolean().nullable()
        })
        .nullable()
})

const updateUserSchema = yup.object().shape({
    name: yup.string(),
    email: yup.string(),
    phone: yup.string(),
    isActive: yup.boolean(),
    password: yup.string(),
    roleId: yup.number()
})

const editProfileSchema = yup.object().shape({
    name: yup.string(),
    email: yup.string(),
    phone: yup.string(),
    companyName: yup.string(),
    image: yup.string()
})

const chnagePasswordSchema = yup.object().shape({
    oldPassword: yup.string().required(),
    newPassword: yup.string().required()
})

const addEmailErpSchema = yup.object().shape({
    emailErpClient: yup.string(),
    nameCategory: yup.string()
})

const createEmployee = async (req: Request, res: Response) => {
    const { email, name, phone, roleId } = req.body
    const user = req.user
    try {
        await validateSchema(createEmployeeSchema, req.body)

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        const existingUserWithEmail = await User.findOne({
            where: { email }
        })

        if (existingUserWithEmail) {
            return sendApiResponse(res, 400, MSG.EMAIL_ALREADY_EXISTS, null)
        }

        const existingUserWithPhone = await User.findOne({
            where: { phone }
        })

        if (existingUserWithPhone) {
            return sendApiResponse(res, 400, MSG.PHONE_ALREADY_EXISTS, null)
        }

        const existingRole = await Role.findOne({
            where: { id: roleId }
        })

        if (!existingRole) {
            return sendApiResponse(res, 404, MSG.ROLE_NOT_FOUND, null)
        }

        const type = await Type.findOne({
            where: { name: ROLES.EMPLOYEE }
        })

        if (!type) {
            return sendApiResponse(res, 404, MSG.ROLE_NOT_FOUND, null)
        }

        const password = generateRandomPassword(12)
        const newEmployee = await User.create({
            email,
            name,
            phone,
            typeId: type.id,
            password: bcrypt.hashSync(password, 10),
            isActive: true,
            tenantId: user.tenantId || user.id
        })

        await UserRole.create({
            userId: newEmployee.id,
            roleId
        })

        const EmailBody: EmailBody = {
            name: name,
            email: email,
            password: password
        }

        const emailSent = await sendEmail(EmailBody, SubjectEmail.ADD)
        if (!emailSent) {
            return sendApiResponse(res, 400, MSG.EMAIL_NOT_SENT, null)
        }

        const data = await User.findOne({
            attributes: { exclude: ['password', 'resetToken'] },
            where: { id: newEmployee.id },
            include: [
                {
                    model: Role,
                    as: 'role'
                }
            ]
        })

        return sendApiResponse(res, 200, MSG.USER_ADDED_SUCC, data)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.log(error)
            return errorServerResponse(res)
        }
    }
}

const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = req.user
    try {
        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const userData = await User.findOne({ where: { id } })
        if (!userData) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const canDelete = userData.tenantId === user.id
        if (!canDelete) {
            return sendApiResponse(res, 401, MSG.UNAUTHORIZED, null)
        }

        userData.isDeleted = true
        await userData.save()

        return sendApiResponse(res, 200, MSG.USER_DELETED_SUCC, null)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.log(error)
            return errorServerResponse(res)
        }
    }
}

const getAllUsers = async (req: Request, res: Response) => {
    const { page, itemsPerPage, typeUser, searchKeyword } = req.query
    const user = req.user
    const filters = req.query.filters as ParsedQs
    try {
        await validateSchema(getAllUsersSchema, {
            page,
            itemsPerPage,
            searchKeyword,
            typeUser,
            filters
        })

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        const type = await Type.findOne({
            where: { name: typeUser }
        })

        if (!type) {
            return sendApiResponse(res, 400, MSG.ROLE_NOT_FOUND, null)
        }

        if (user.role === ROLES_USER.CLIENT) {
            return sendApiResponse(res, 400, MSG.UNAUTHORIZED, null)
        }

        let initialClause = { tenantId: user.tenantId || user.id, typeId: type.id, isDeleted: false }

        const dynamicWhereClause = buildDynamicWhereClause(filters, initialClause)

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
                        email: {
                            [Op.substring]: searchKeyword
                        }
                    },
                    {
                        phone: {
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
            include: [
                {
                    model: Role,
                    as: 'role',
                    through: { attributes: [] }
                }
            ],
            where: {
                [Op.and]: whereClauses
            }
        }

        if (page && itemsPerPage) {
            query.limit = parseInt(`${itemsPerPage}`)
            query.offset = (parseInt(`${page}`) - 1) * parseInt(`${itemsPerPage}`)
        }

        const users = await User.findAll(query)

        const message = users.length
            ? searchKeyword
                ? MSG.FILTERED_USERS_FETCHED_SUCC
                : MSG.USERS_FETCHED_SUCC
            : searchKeyword
            ? MSG.NO_FILTERED_USERS_LIST
            : MSG.NO_USERS_LIST

        return await sendApiResponse(res, 200, message, {
            list: users,
            page: parseInt(`${page}`),
            itemsPerPage: parseInt(`${itemsPerPage}`),
            total
        })
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching users:', error)
            return errorServerResponse(res)
        }
    }
}

const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params
    const { name, email, phone, password, isActive, roleId } = req.body
    const user = req.user
    try {
        await validateSchema(updateUserSchema, req.body)

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const userData = await User.findOne({
            where: { id }
        })

        if (!userData) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        if (userData.tenantId !== (user.tenantId || user.id)) {
            return sendApiResponse(res, 400, MSG.UNAUTHORIZED, null)
        }

        if (phone && userData.phone !== phone) {
            const existingUserWithPhone = await User.findOne({
                where: { phone }
            })

            if (existingUserWithPhone) {
                return sendApiResponse(res, 400, MSG.PHONE_ALREADY_EXISTS, null)
            }
        }

        if (email && userData.email !== email) {
            const existingUserWithEmail = await User.findOne({
                where: { email }
            })

            if (existingUserWithEmail) {
                return sendApiResponse(res, 400, MSG.EMAIL_ALREADY_EXISTS, null)
            }
        }

        const updatedUser = await userData.update({
            name,
            email,
            phone,
            password: password ? bcrypt.hashSync(password, 10) : userData.password,
            isActive,
            roleId
        })

        await UserRole.update(
            {
                roleId
            },
            { where: { userId: id } }
        )

        const data = updatedUser.toJSON()
        delete data.password
        delete data.resetToken

        return sendApiResponse(res, 200, MSG.USER_UPDATED_SUCC, data)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.log(error)
            return errorServerResponse(res)
        }
    }
}

const editProfile = async (req: Request, res: Response) => {
    const { name, email, phone, companyName } = req.body
    const user = req.user
    try {
        await validateSchema(editProfileSchema, req.body)

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        const userData = await User.findOne({
            where: { id: user.id }
        })

        if (!userData) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        if (email && email !== userData.email) {
            const existingUserWithEmail = await User.findOne({
                where: { email }
            })

            if (existingUserWithEmail) {
                return sendApiResponse(res, 400, MSG.EMAIL_ALREADY_EXISTS, null)
            }
        }

        if (phone && phone !== userData.phone) {
            const existingUserWithPhone = await User.findOne({
                where: { phone }
            })

            if (existingUserWithPhone) {
                return sendApiResponse(res, 400, MSG.PHONE_ALREADY_EXISTS, null)
            }
        }

        let imageUrl = userData.image ?? ''

        if (req.file) {
            const imageName = uuidv4() + path.extname(req.file.originalname)
            const imagePath = path.join(process.env.IMAGES_DIRECTORY!, imageName)

            try {
                if (!fs.existsSync(process.env.IMAGES_DIRECTORY!)) {
                    fs.mkdirSync(process.env.IMAGES_DIRECTORY!, { recursive: true })
                }
            } catch (mkdirErr) {
                console.error('Error creating directory:', mkdirErr)
                throw new Error('Failed to create images directory')
            }

            try {
                fs.writeFileSync(imagePath, req.file.buffer)
                imageUrl = `/${imageName}`
            } catch (writeErr) {
                console.error('Error writing file:', writeErr)
                throw new Error('Failed to write image file')
            }
        }

        const updatedUser = await userData.update({
            name,
            email,
            phone,
            companyName,
            image: imageUrl
        })

        const data = updatedUser.toJSON()
        delete data.password
        delete data.resetToken

        return sendApiResponse(res, 200, MSG.PROFILE_EDITED_SUCC, data)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.log(error)
            return errorServerResponse(res)
        }
    }
}

const changePassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body
    const user = req.user
    try {
        await validateSchema(chnagePasswordSchema, req.body)

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        const userData = await User.findOne({
            where: { id: user.id }
        })

        if (!userData) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const isPasswordCorrect = await bcrypt.compare(oldPassword, userData.password)

        if (!isPasswordCorrect) {
            return sendApiResponse(res, 400, MSG.WRONG_PASSWORD, null)
        }

        const updatedUser = await userData.update({
            password: bcrypt.hashSync(newPassword, 10)
        })

        const data = updatedUser.toJSON()
        delete data.password
        delete data.resetToken

        return sendApiResponse(res, 200, MSG.PASSWORD_CHANGED_SUCC, data)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.log(error)
            return errorServerResponse(res)
        }
    }
}

const getUser = async (req: Request, res: Response) => {
    const user = req.user
    const { id } = req.params
    try {
        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: null })
        }

        if (!id) {
            return res.status(400).json({ success: false, message: MSG.INVALID_ID, data: null })
        }

        const userData = await User.findOne({ where: { id } })
        if (!userData) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const data = userData.toJSON()
        delete data.password
        delete data.resetToken

        return sendApiResponse(res, 200, MSG.USER_FETCHED_SUCC, data)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching user:', error)
            return errorServerResponse(res)
        }
    }
}

const getUserData = async (req: Request, res: Response) => {
    const user = req.user
    try {
        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: null })
        }

        const userData = await User.findOne({ where: { id: user.tenantId || user.id } })
        if (!userData) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const data = userData.toJSON()
        delete data.password
        delete data.resetToken

        return sendApiResponse(res, 200, MSG.USER_FETCHED_SUCC, data)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching user:', error)
            return errorServerResponse(res)
        }
    }
}

const addEmailErp = async (req: Request, res: Response) => {
    const { emailErpClient, nameCategory } = req.body
    const user = req.user
    try {
        await validateSchema(addEmailErpSchema, req.body)

        if (!user) {
            throw new Error(MSG.NO_USER)
        }

        const userData = await User.findOne({
            where: { id: user.tenantId || user.id },
            attributes: { exclude: ['password', 'resetToken'] }
        })

        if (!userData) {
            throw new Error(MSG.NOT_FOUND)
        }

        if (emailErpClient && emailErpClient !== userData.emailErpClient) {
            const erpClient = await getPartnerWithEmail(emailErpClient)
            if (!erpClient.isExist) {
                throw new Error(MSG.EMAIL_ERP_NOT_EXIST)
            }
            userData.isErpClient = true
            userData.emailErpClient = emailErpClient
        }

        if (nameCategory && nameCategory !== userData.nameCategory) {
            userData.nameCategory = nameCategory
        }

        userData.save()

        return sendApiResponse(res, 200, MSG.EMAIL_ERP_ADDED_SUCC, userData)
    } catch (error: any) {
        let errorMessage

        if (error instanceof yup.ValidationError) {
            errorMessage = MSG.DATA_MISSING
        } else if (error.message) {
            errorMessage = error.message
        }

        console.error('Error add email:', error)
        return errorServerResponse(res, errorMessage)
    }
}

export { createEmployee, deleteUser, getAllUsers, updateUser, editProfile, changePassword, getUser, getUserData, addEmailErp }
