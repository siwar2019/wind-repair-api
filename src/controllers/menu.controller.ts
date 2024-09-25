import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import { errorServerResponse, sendApiResponse, validateSchema } from '../common/functions'
import * as yup from 'yup'
import { Button } from '../models/button.model'
import { Menu } from '../models/menu.model'
import { MenusRole } from '../models/menusRole.model'
import { Role } from '../models/role.model'
import { IButton } from '../interfaces/menuData'
import { UserRole } from '../models/userRole.model'
import { User } from '../models/user.model'
import { sequelize } from '../config/db'
import { Op } from 'sequelize'
import { TButton } from '../interfaces/button'
dotenv.config()

const createMenuSchema = yup.object().shape({
    menus: yup
        .array()
        .of(
            yup.object().shape({
                menuName: yup.string().required(),
                actionId: yup.string().required(),
                buttons: yup
                    .array()
                    .of(
                        yup.object().shape({
                            buttonName: yup.string().required(),
                            actionId: yup.string().required()
                        })
                    )
                    .required()
            })
        )
        .required()
})

const updateMenuSchema = yup.object().shape({
    name: yup.string(),
    actionId: yup.string(),
    buttons: yup.array().of(
        yup.object().shape({
            name: yup.string(),
            actionId: yup.string()
        })
    ),
    idsDeleted: yup.array().of(yup.number())
})

const createMenus = async (req: Request, res: Response) => {
    const { menus } = req.body

    const transaction = await sequelize.transaction()

    try {
        await validateSchema(createMenuSchema, req.body)

        const menuErrors = []
        const buttonErrors = []

        for (const menu of menus) {
            const existingMenu = await Menu.findOne({
                where: {
                    [Op.or]: [{ name: menu.menuName }, { actionId: menu.actionId }]
                }
            })

            if (existingMenu) {
                menuErrors.push({ menuName: menu.menuName, error: MSG.MENU_ALREADY_EXISTS })
                continue
            }

            const newMenu = await Menu.create(
                {
                    name: menu.menuName,
                    actionId: menu.actionId
                },
                { transaction }
            )

            const buttons = menu.buttons.map(async (button: TButton) => {
                const { buttonName, actionId } = button
                const existingButton = await Button.findOne({
                    where: {
                        [Op.or]: [{ name: buttonName }, { actionId }]
                    }
                })

                if (existingButton) {
                    buttonErrors.push({ buttonName: button.buttonName, error: MSG.BUTTON_ALREADY_EXISTS })
                    return
                }

                await Button.create(
                    {
                        name: buttonName,
                        menuId: newMenu.id,
                        actionId
                    },
                    { transaction }
                )
            })

            await Promise.all(buttons)
        }

        if (buttonErrors.length > 0) {
            await transaction.rollback()
            return sendApiResponse(res, 400, MSG.BUTTON_ALREADY_EXISTS, null)
        }

        if (menuErrors.length > 0) {
            await transaction.rollback()
            return sendApiResponse(res, 400, MSG.MENU_ALREADY_EXISTS, null)
        }

        await transaction.commit()

        const data = await Menu.findAll({
            include: [
                {
                    model: Button,
                    as: 'buttons'
                }
            ],
            order: [['id', 'ASC']]
        })

        return sendApiResponse(res, 200, MSG.MENU_ADDED_SUCC, data)
    } catch (error) {
        await transaction.rollback()
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.log(error)
            return errorServerResponse(res)
        }
    }
}

const getAllMenus = async (req: Request, res: Response) => {
    try {
        const menus = await Menu.findAll({
            include: [
                {
                    model: Button,
                    as: 'buttons'
                }
            ],
            order: [['id', 'ASC']]
        })
        return sendApiResponse(res, 200, MSG.MENUS_FETCHED_SUCC, menus)
    } catch (error) {
        console.error(error)
        return errorServerResponse(res)
    }
}

const getAllMenusPartner = async (req: Request, res: Response) => {
    try {
        const menus = await Menu.findAll({
            include: [
                {
                    model: Button,
                    as: 'buttons'
                }
            ],
            order: [['id', 'ASC']]
        })

        const modifiedMenus = menus.map((menu) => {
            const buttonsWithChecked = menu.buttons.map((button) => {
                const { id, name, menuId, actionId } = button.toJSON()
                return {
                    id,
                    name,
                    menuId,
                    checked: false,
                    actionId
                }
            })
            const { id, name, actionId } = menu.toJSON()
            return {
                id,
                name,
                actionId,
                buttons: buttonsWithChecked
            }
        })

        return sendApiResponse(res, 200, MSG.MENUS_FETCHED_SUCC, modifiedMenus)
    } catch (error) {
        console.error(error)
        return errorServerResponse(res)
    }
}

const getAllMenusRole = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = req.user
    try {
        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: null })
        }

        const role = await Role.findOne({ where: { id } })

        if (!role) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        if (role.createdBy !== (user.tenantId || user.id)) {
            return res.status(400).json({ success: false, message: MSG.UNAUTHORIZED, data: null })
        }

        const menus = await MenusRole.findAll({
            where: { roleId: id },
            order: [['menuId', 'ASC']]
        })

        const menuMap = new Map()

        await Promise.all(
            menus.map(async (menuRole) => {
                if (!menuMap.has(menuRole.menuId)) {
                    const menu = await Menu.findOne({ where: { id: menuRole.menuId } })
                    if (menu) {
                        menuMap.set(menuRole.menuId, {
                            id: menuRole.menuId,
                            name: menu.name,
                            actionId: menu.actionId,
                            buttons: []
                        })
                    }
                }

                const button = await Button.findOne({ where: { id: menuRole.buttonId } })
                if (button) {
                    const menuEntry = menuMap.get(menuRole.menuId)
                    menuEntry.buttons.push({
                        id: menuRole.buttonId,
                        actionId: button.actionId,
                        name: button.name,
                        menuId: menuRole.menuId,
                        checked: menuRole.checked
                    })

                    menuEntry.buttons.sort((a: IButton, b: IButton) => a.id - b.id)
                }
            })
        )

        const formattedMenus = Array.from(menuMap.values())

        formattedMenus.sort((a, b) => a.id - b.id)

        return sendApiResponse(res, 200, MSG.MENUS_FETCHED_SUCC, formattedMenus)
    } catch (error) {
        console.error(error)
        return errorServerResponse(res)
    }
}

const getPermessions = async (req: Request, res: Response) => {
    const user = req.user
    try {
        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: null })
        }

        const userData = await User.findOne({ where: { id: user.id } })

        if (!userData) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const userRole = await UserRole.findOne({ where: { userId: user.id } })

        if (!userRole) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const role = await Role.findOne({ where: { id: userRole.roleId } })

        if (!role) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const menus = await MenusRole.findAll({
            where: {
                roleId: role.id
            },
            order: [['menuId', 'ASC']]
        })

        const menuMap = new Map()

        await Promise.all(
            menus.map(async (menuRole) => {
                if (!menuMap.has(menuRole.menuId)) {
                    const menu = await Menu.findOne({ where: { id: menuRole.menuId } })
                    if (menu) {
                        menuMap.set(menuRole.menuId, {
                            id: menuRole.menuId,
                            name: menu.name,
                            actionId: menu.actionId,
                            buttons: []
                        })
                    }
                }

                const button = await Button.findOne({ where: { id: menuRole.buttonId } })
                if (button) {
                    const menuEntry = menuMap.get(menuRole.menuId)
                    menuEntry.buttons.push({
                        id: menuRole.buttonId,
                        actionId: button.actionId,
                        name: button.name,
                        menuId: menuRole.menuId,
                        checked: menuRole.checked
                    })
                    menuEntry.buttons.sort((a: IButton, b: IButton) => a.id - b.id)
                }
            })
        )

        const formattedMenus = Array.from(menuMap.values())

        formattedMenus.sort((a, b) => a.id - b.id)

        return sendApiResponse(res, 200, MSG.MENUS_FETCHED_SUCC, formattedMenus)
    } catch (error) {
        console.error(error)
        return errorServerResponse(res)
    }
}

const updateMenu = async (req: Request, res: Response) => {
    const { id } = req.params
    const { name, actionId, buttons, idsDeleted } = req.body

    const transaction = await sequelize.transaction()

    try {
        await validateSchema(updateMenuSchema, req.body)

        const menu = await Menu.findOne({
            where: {
                id
            }
        })

        if (!menu) {
            await transaction.rollback()
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        if (menu.name !== name) {
            const menuData = await Menu.findOne({
                where: {
                    name
                }
            })

            if (menuData) {
                await transaction.rollback()
                return sendApiResponse(res, 400, MSG.MENU_ALREADY_EXISTS, null)
            }
        }

        if (menu.actionId !== actionId) {
            const menuData = await Menu.findOne({
                where: {
                    actionId
                }
            })

            if (menuData) {
                await transaction.rollback()
                return sendApiResponse(res, 400, MSG.MENU_ALREADY_EXISTS, null)
            }
        }

        await Menu.update(
            {
                name,
                actionId
            },
            {
                where: { id },
                transaction
            }
        )

        if (idsDeleted && idsDeleted.length > 0) {
            await Button.destroy({ where: { id: idsDeleted, menuId: id }, transaction })
        }

        if (buttons) {
            for (const button of buttons) {
                if (button.id) {
                    const existingButton = await Button.findOne({ where: { id: button.id, menuId: id } })

                    if (existingButton) {
                        if (existingButton.name !== button.name) {
                            const buttonData = await Button.findOne({
                                where: {
                                    name: button.name,
                                    menuId: id
                                }
                            })

                            if (buttonData) {
                                await transaction.rollback()
                                return sendApiResponse(res, 400, MSG.BUTTON_ALREADY_EXISTS, null)
                            }
                        }
                        if (existingButton.actionId !== button.actionId) {
                            const buttonData = await Button.findOne({
                                where: {
                                    actionId: button.actionId,
                                    menuId: id
                                }
                            })

                            if (buttonData) {
                                await transaction.rollback()
                                return sendApiResponse(res, 400, MSG.BUTTON_ALREADY_EXISTS, null)
                            }
                        }
                        await existingButton.update(
                            {
                                actionId: button.actionId,
                                name: button.name
                            },
                            { transaction }
                        )
                        continue
                    }
                }

                const existingButton = await Button.findOne({
                    where: {
                        [Op.or]: [{ name: button.name }, { actionId: button.actionId }],
                        menuId: id
                    }
                })
                if (existingButton) {
                    await transaction.rollback()
                    return sendApiResponse(res, 400, MSG.BUTTON_ALREADY_EXISTS, null)
                }

                await Button.create(
                    {
                        name: button.name,
                        actionId: button.actionId,
                        menuId: id
                    },
                    { transaction }
                )
            }
        }

        await transaction.commit()

        const data = await Menu.findOne({
            where: { id },
            include: [
                {
                    model: Button,
                    as: 'buttons'
                }
            ]
        })

        return sendApiResponse(res, 200, MSG.MENU_UPDATED_SUCC, data)
    } catch (error) {
        await transaction.rollback()
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.log(error)
            return errorServerResponse(res)
        }
    }
}

const deleteMenu = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const menu = await Menu.findOne({ where: { id } })

        if (!menu) return sendApiResponse(res, 404, MSG.MENU_NOT_FOUND, null)

        await menu.destroy()

        return sendApiResponse(res, 200, MSG.MENU_DELETED_SUCC, null)
    } catch (error) {
        console.log(error)
        return errorServerResponse(res)
    }
}

export { updateMenu, deleteMenu, createMenus, getAllMenus, getAllMenusPartner, getAllMenusRole, getPermessions }
