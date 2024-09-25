import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import { errorServerResponse, sendApiResponse, validateSchema } from '../common/functions'
import * as yup from 'yup'
import { Role } from '../models/role.model'
import { MenusRole } from '../models/menusRole.model'
import { IButton, IMenu } from '../interfaces/menuData'
import { sequelize } from '../config/db'
dotenv.config()

const createRoleSchema = yup.object().shape({
    name: yup.string().required(),
    menus: yup
        .array()
        .of(
            yup.object().shape({
                name: yup.string().required(),
                actionId: yup.string().required(),
                id: yup.number().required(),
                buttons: yup
                    .array()
                    .of(
                        yup.object().shape({
                            id: yup.number().required(),
                            menuId: yup.number().required(),
                            name: yup.string().required(),
                            checked: yup.boolean().required()
                        })
                    )
                    .required()
            })
        )
        .required()
})

const updateRoleSchema = yup.object().shape({
    name: yup.string().required(),
    menus: yup
        .array()
        .of(
            yup.object().shape({
                name: yup.string().required(),
                id: yup.number().required(),
                actionId: yup.string().required(),
                buttons: yup
                    .array()
                    .of(
                        yup.object().shape({
                            id: yup.number().required(),
                            menuId: yup.number().required(),
                            actionId: yup.string().required(),
                            name: yup.string().required(),
                            checked: yup.boolean().required()
                        })
                    )
                    .required()
            })
        )
        .required()
})

const createRole = async (req: Request, res: Response) => {
    const { name, menus } = req.body
    const user = req.user
    const transaction = await sequelize.transaction()
    try {
        await validateSchema(createRoleSchema, req.body)

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        const newRole = await Role.create(
            {
                name,
                createdBy: user.tenantId || user.id
            },
            { transaction }
        )

        const createMenusRoles = menus.flatMap((menu: IMenu) =>
            menu.buttons.map((button: IButton) =>
                MenusRole.create(
                    {
                        roleId: newRole.id,
                        buttonId: button.id,
                        menuId: menu.id,
                        checked: button.checked
                    },
                    { transaction }
                )
            )
        )

        await Promise.all(createMenusRoles)

        await transaction.commit()

        return sendApiResponse(res, 200, MSG.ROLE_ADDED_SUCC, newRole)
    } catch (error) {
        await transaction.rollback()
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error create role:', error)
            return errorServerResponse(res)
        }
    }
}

const updateRole = async (req: Request, res: Response) => {
    const { name, menus } = req.body
    const { id } = req.params
    const transaction = await sequelize.transaction()
    try {
        await validateSchema(updateRoleSchema, req.body)

        const existingRole = await Role.findOne({ where: { id } })
        if (!existingRole) {
            return res.status(404).json({ success: false, message: MSG.ROLE_NOT_FOUND, data: null })
        }
        await existingRole.update({ name }, { transaction })

        const updateButtons = menus.flatMap((menu: IMenu) =>
            menu.buttons.map((button: IButton) =>
                MenusRole.update(
                    { checked: button.checked },
                    {
                        where: {
                            roleId: id,
                            buttonId: button.id,
                            menuId: menu.id
                        },
                        transaction
                    }
                )
            )
        )

        await Promise.all(updateButtons)

        await transaction.commit()

        return sendApiResponse(res, 200, MSG.ROLE_UPDATED_SUCC, existingRole)
    } catch (error) {
        await transaction.rollback()
        console.error('Error updating role:', error)
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            return errorServerResponse(res)
        }
    }
}

const getAllRoles = async (req: Request, res: Response) => {
    const user = req.user
    try {
        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        const roles = await Role.findAll({ where: { createdBy: user.tenantId || user.id, isDeleted: false } })

        return sendApiResponse(res, 200, MSG.ROLES_FETCHED_SUCC, roles)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching roles:', error)
            return errorServerResponse(res)
        }
    }
}

const deleteRole = async (req: Request, res: Response) => {
    const user = req.user
    const { id } = req.params
    try {
        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const role = await Role.findOne({
            where: { id }
        })

        if (!role) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        if (role.createdBy != (user.tenantId || user.id)) {
            return sendApiResponse(res, 403, MSG.FORBIDDEN, null)
        }
        role.isDeleted = true
        await role.save()

        return sendApiResponse(res, 200, MSG.ROLE_DELETED_SUCC, null)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error deleting role:', error)
            return errorServerResponse(res)
        }
    }
}

export { createRole, getAllRoles, deleteRole, updateRole }
