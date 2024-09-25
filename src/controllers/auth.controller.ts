import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import { errorServerResponse, sendApiResponse, sendEmail, validateSchema } from '../common/functions'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import * as yup from 'yup'
import { User } from '../models/user.model'
import { Admin } from '../models/admin.model'
import { ROLES, SubjectEmail, TYPE_PAYMENT } from '../utils/constant'
import { EmailBody } from '../interfaces/emailBody'
import { Type } from '../models/type.model'
import { Op } from 'sequelize'
import { CashRegister } from '../models/cashRegister.model'
import { sequelize } from '../config/db'
import { SubscriptionPayment } from '../models/subscriptionPayment.model'
import { ErpSettings } from '../models/erpSetting.model'
import axios from 'axios'
import { getPartnerWithEmail } from './settings.controller'
dotenv.config()

const LoginSchema = yup.object().shape({
    login: yup.string().required(),
    password: yup.string().min(6).required()
})

const RegisterSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
    phone: yup.string().min(8).max(8).required(),
    companyName: yup.string().required(),
    typePayment: yup.string().oneOf(Object.values(TYPE_PAYMENT)).required(),
    subscriptionId: yup.number().required(),
    nbrEmploye: yup.number().required()
})

const ForgotSchema = yup.object().shape({
    email: yup.string().email().required()
})

const ResetSchema = yup.object().shape({
    password: yup.string().min(6).required(),
    resetToken: yup.string().required()
})

const login = async (req: Request, res: Response) => {
    const { login, password } = req.body
    try {
        await validateSchema(LoginSchema, req.body)

        const [user, admin] = await Promise.all([
            User.findOne({
                where: {
                    [Op.or]: [{ email: login }, { phone: login }]
                }
            }),
            Admin.findOne({ where: { email: login } })
        ])

        const authenticatedUser = user || admin

        if (!authenticatedUser) {
            return sendApiResponse(res, 400, MSG.NOT_FOUND, null)
        }

        const isPasswordCorrect = await bcrypt.compare(password, authenticatedUser.password)

        if (!isPasswordCorrect) {
            return sendApiResponse(res, 400, MSG.WRONG_CREDENTIALS, null)
        }

        let token
        let data

        if (user) {
            const type = await Type.findOne({ where: { id: user.typeId } })

            if (!type) {
                return sendApiResponse(res, 400, MSG.ROLE_NOT_FOUND, null)
            }

            if (type.name === ROLES.PARTNER) {
                const payment = await SubscriptionPayment.findOne({
                    where: {
                        userId: user.id
                    },
                    order: [['createdAt', 'DESC']]
                })

                if (!payment) {
                    return sendApiResponse(res, 400, MSG.NOT_FOUND, null)
                }

                if (payment.type === TYPE_PAYMENT.standard && !payment.payed) {
                    return sendApiResponse(res, 400, MSG.SUBSCRIPTION_NOT_PAID, null)
                }

                const currentDate = new Date()
                const endDate = new Date(payment.endDate)

                if (currentDate > endDate) {
                    return sendApiResponse(res, 400, MSG.SUBSCRIPTION_EXPIRED, null)
                }
            }

            if (!user.isActive || user.isDeleted) {
                return sendApiResponse(res, 400, MSG.ACCOUNT_NOT_VERIFIED, null)
            }

            token = jwt.sign(
                {
                    role: type.name,
                    id: user.id,
                    tenantId: user.tenantId,
                    typeId: user.typeId
                },
                process.env.JWT!,
                {
                    expiresIn: '24h'
                }
            )
            data = user.toJSON()
            data.role = type.name
            delete data.password
            delete data.resetToken
        } else if (admin) {
            token = jwt.sign(
                {
                    role: ROLES.ADMIN
                },
                process.env.JWT!,
                {
                    expiresIn: '24h'
                }
            )
            data = admin.toJSON()
            data.role = ROLES.ADMIN
            delete data.password
            delete data.resetToken
        }

        return sendApiResponse(res, 200, MSG.LOGGED_IN, data, token)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error logging in:', error)
            return errorServerResponse(res)
        }
    }
}

const register = async (req: Request, res: Response) => {
    const { email, password, phone, companyName, typePayment, subscriptionId, nbrEmploye } = req.body
    const transaction = await sequelize.transaction()
    try {
        await validateSchema(RegisterSchema, req.body)

        const existingUserWithPhone = await User.findOne({
            where: { phone }
        })

        if (existingUserWithPhone) {
            return sendApiResponse(res, 400, MSG.PHONE_ALREADY_EXISTS, null)
        }

        const existingUserWithEmail = await User.findOne({
            where: { email }
        })

        if (existingUserWithEmail) {
            return sendApiResponse(res, 400, MSG.EMAIL_ALREADY_EXISTS, null)
        }

        const type = await Type.findOne({
            where: { name: ROLES.PARTNER }
        })

        if (!type) {
            return sendApiResponse(res, 400, MSG.ROLE_NOT_FOUND, null)
        }

        const erpClient = await getPartnerWithEmail(email)

        const newUser = await User.create(
            {
                email,
                password: bcrypt.hashSync(password, 10),
                phone,
                companyName,
                typeId: type.id,
                isErpClient: erpClient.isExist,
                emailErpClient: erpClient.isExist ? email : ''
            },
            { transaction }
        )

        ErpSettings.create(
            {
                userId: newUser.id
            },
            { transaction }
        )

        await CashRegister.create(
            {
                userId: newUser.id,
                main: true,
                bankAccount: '',
                name: 'Caisse principale'
            },
            { transaction }
        )

        const currentDate = new Date()
        const endDate = new Date(currentDate)

        endDate.setDate(currentDate.getDate() + 14)

        await SubscriptionPayment.create(
            {
                userId: newUser.id,
                type: typePayment,
                startDate: currentDate,
                endDate: endDate,
                subscriptionId,
                nbrEmploye,
                payed: false
            },
            { transaction }
        )

        const data = newUser.toJSON()
        delete data.password
        delete data.resetToken

        const dataEmail: EmailBody = {
            name: companyName,
            email: email,
            password
        }

        await transaction.commit()

        const emailSent = await sendEmail(dataEmail, SubjectEmail.ADD)
        if (!emailSent) {
            return sendApiResponse(res, 400, MSG.EMAIL_NOT_SENT, null)
        }

        return sendApiResponse(res, 200, MSG.PARTNER_ADDED_SUCC, data)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error registering user:', error)
            return errorServerResponse(res)
        }
    }
}

const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body
    const transaction = await sequelize.transaction()
    try {
        await validateSchema(ForgotSchema, req.body)

        const user = await User.findOne({
            where: { email: email, isDeleted: false, tenantId: null }
        })

        if (!user) {
            return sendApiResponse(res, 400, MSG.NOT_FOUND, null)
        }

        const token = jwt.sign(
            {
                id: user.id
            },
            process.env.JWT!,
            {
                expiresIn: '5h'
            }
        )

        user.resetToken = token
        user.save({ transaction })

        const link = `http://${process.env.HOST_FRONT}/auth/reset-password/${token}`

        const data: EmailBody = {
            name: user.companyName,
            email: email,
            link: link
        }

        const emailSent = await sendEmail(data, SubjectEmail.forgotPassword)

        await transaction.commit()

        return emailSent ? sendApiResponse(res, 200, MSG.EMAIL_SENT, null) : sendApiResponse(res, 400, MSG.EMAIL_NOT_SENT, null)
    } catch (error) {
        await transaction.rollback()
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            return errorServerResponse(res)
        }
    }
}

const resetPassword = async (req: Request, res: Response) => {
    const { password, resetToken } = req.body
    const user = req.user
    try {
        await validateSchema(ResetSchema, req.body)

        if (!user) {
            throw new Error(MSG.NO_TOKEN)
        }

        const userData = await User.findOne({
            where: {
                id: user.id
            }
        })

        if (!userData) {
            return sendApiResponse(res, 400, MSG.NOT_FOUND, null)
        }

        if (userData.resetToken !== resetToken) {
            return sendApiResponse(res, 400, MSG.INVALID_TOKEN, null)
        }

        const hashedPassword = bcrypt.hashSync(password, 10)

        try {
            await User.update({ password: hashedPassword, resetToken: null }, { where: { id: user.id } })
            return sendApiResponse(res, 200, MSG.PASS_UPDATE_SUCC, null)
        } catch (err) {
            return sendApiResponse(res, 400, MSG.PASS_UPDATE_FAIL, null)
        }
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            return errorServerResponse(res)
        }
    }
}

export { login, register, forgotPassword, resetPassword }
