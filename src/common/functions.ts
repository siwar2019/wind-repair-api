import { Response } from 'express'
import { MSG } from './responseMessages'
import * as yup from 'yup'
import bcrypt from 'bcrypt'
import { Admin } from '../models/admin.model'
import {
    ACCOUNT_VERIFID_SUBJECT,
    EMAIL_FROM_NAME,
    PASSWORD_RESET,
    ROLES,
    SubjectEmail,
    VERIFY_ACCOUNT_SUBJECT
} from '../utils/constant'
import { EmailBody } from '../interfaces/emailBody'
import { EmailOptions } from '../interfaces/emailOptions'
import nodemailer from 'nodemailer'
import { mailBodyForAddPartner, mailBodyForActivePartner, mailBodyForResetPassword } from './mailBody'
import { TDecodedUser } from '../interfaces/user'
import { Type } from '../models/type.model'
import { Subscription } from '../models/subscription.model'
import { Menu } from '../models/menu.model'
import { Button } from '../models/button.model'
import { menusData } from '../utils/data'
import { sequelize } from '../config/db'
import { Language } from '../interfaces/language'
import { ParsedQs } from 'qs'
import { Op } from 'sequelize'

export const errorServerResponse = (res: Response, message: string = MSG.SERVER_ERROR) => {
    return res.status(500).send({
        success: false,
        message: message,
        data: null
    })
}

export const sendApiResponse = async (res: Response, status: number, message: string, data: unknown, token?: string) => {
    return res.status(status).send({
        success: status === 200,
        message: message,
        data: data,
        token: token
    })
}

export const validateSchema = async (schema: yup.ObjectSchema<any>, data: unknown) => {
    await schema.validate(data, { abortEarly: false }).catch((error) => {
        throw error
    })
}

export const encrypt = (password: string) => {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salt)
}

export const generateRandomPassword = (length: number = 12): string => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+'
    let password = ''
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        password += characters[randomIndex]
    }
    return password
}

export const createAdmin = async () => {
    const transaction = await sequelize.transaction()
    try {
        await Admin.create(
            {
                email: process.env.EMAIL_ADMIN,
                password: encrypt(process.env.PASS_ADMIN as string),
                isActive: true,
                role: ROLES.ADMIN
            },
            { transaction }
        )
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        console.error('Error while creating admin:', error)
    }
}

export const sendEmail = async (emailBody: EmailBody, subject: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER_FROM,
            pass: process.env.GMAIL_PASS
        }
    })

    let subjectEmail
    let htmlEmail
    if (subject === SubjectEmail.ADD) {
        subjectEmail = VERIFY_ACCOUNT_SUBJECT
        htmlEmail = mailBodyForAddPartner(emailBody)
    } else if (subject === SubjectEmail.ACTIVE) {
        subjectEmail = ACCOUNT_VERIFID_SUBJECT
        htmlEmail = mailBodyForActivePartner(emailBody)
    } else if (subject === SubjectEmail.forgotPassword) {
        subjectEmail = PASSWORD_RESET
        htmlEmail = mailBodyForResetPassword(emailBody)
    }

    let emailOptions: EmailOptions = {
        from: EMAIL_FROM_NAME,
        to: emailBody.email,
        subject: subjectEmail ?? '',
        html: htmlEmail ?? ''
    }

    try {
        await transporter.sendMail(emailOptions)
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

export const checkPartnerProduct = (user: TDecodedUser, partnerId: number) => {
    return user.tenantId === partnerId || user.id === partnerId
}

export const initializeDatabase = async () => {
    const transaction = await sequelize.transaction()
    try {
        const adminCount = await Admin.count({ transaction })
        if (adminCount === 0) {
            await createAdmin()
        }

        const typeCount = await Type.count({ transaction })
        if (typeCount === 0) {
            const defaultTypes = [ROLES.PARTNER, ROLES.EMPLOYEE, ROLES.CLIENT]
            const createTypes = defaultTypes.map((typeName) => {
                return new Promise((resolve, reject) => {
                    Type.create({ name: typeName }).then(resolve).catch(reject)
                })
            })
            await Promise.all(createTypes)
        }

        const subscriptionCount = await Subscription.count({ transaction })
        if (subscriptionCount < 2) {
            await createSubscription()
        }

        const menusCount = await Menu.count({ transaction })
        if (menusCount === 0) {
            await createMenus()
        }

        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        console.error(error)
    }
}

export const createSubscription = async () => {
    const transaction = await sequelize.transaction()
    try {
        await Subscription.create(
            {
                nbrMaxEmployee: 2,
                price: 10
            },
            { transaction }
        )

        await Subscription.create(
            {
                nbrMaxEmployee: 5,
                price: 20
            },
            { transaction }
        )
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        console.error('Error while creating subscription:', error)
    }
}

export const createMenus = async () => {
    const transaction = await sequelize.transaction()
    try {
        for (const menuData of menusData) {
            const menu = await Menu.create({ name: menuData.name, actionId: menuData.actionId }, { transaction })

            const buttons = menuData.buttons.map((buttonData) => ({
                name: buttonData.name,
                actionId: buttonData.actionId,
                menuId: menu.id
            }))

            await Button.bulkCreate(buttons, { transaction })
        }

        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        console.error('Error while creating menus:', error)
    }
}

export const getProperty = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

export const generateStatusChangeMessage = (status: string, existingStatus: string, language: Language): string => {
    switch (language) {
        case 'fr':
            return `Le statut de votre produit a changé de ${existingStatus} à ${status}`
        case 'en':
        default:
            return `Your product status has changed from ${existingStatus} to ${status}`
    }
}

export const isPlainObject = (obj: any): obj is ParsedQs => {
    return obj && typeof obj === 'object' && !Array.isArray(obj)
}

export const buildDynamicWhereClause = (filters: ParsedQs, initialClause: Record<string, any> = {}) => {
    let dynamicWhereClause: Record<string, any> = { ...initialClause }

    if (isPlainObject(filters)) {
        Object.keys(filters).forEach((key) => {
            const filterValues = filters[key]
            if (Array.isArray(filterValues) && filterValues.length > 0) {
                const parsedValues = filterValues.map((value) => {
                    if (value === 'true') return true
                    if (value === 'false') return false
                    return value
                })
                dynamicWhereClause[key] = {
                    [Op.in]: parsedValues
                }
            }
        })
    }

    return dynamicWhereClause
}
