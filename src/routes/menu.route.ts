import { Router } from 'express'
import { Paths } from '../common/paths'
import { isAuthenticated } from '../middleware/authentication'
import { ROLES } from '../utils/constant'
import {
    createMenus,
    deleteMenu,
    getAllMenus,
    getAllMenusPartner,
    getAllMenusRole,
    getPermessions,
    updateMenu
} from '../controllers/menu.controller'

const menuRoutes = Router()

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: APIs for managing menus
 */

/**
 * @swagger
 * /menu/create-menu:
 *   post:
 *     tags:
 *       - Menu
 *     summary: Create a new menu with optional sub-menus and tabs
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *       - in: body
 *         name: menus
 *         description: Menu data for creation
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             menus:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   menuName:
 *                     type: string
 *                     description: Name of the menu
 *                     example: Main Menu
 *                     required: true
 *                   buttons:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         buttonName:
 *                           type: string
 *                           description: Name of the button
 *                           example: Button 1
 *                           required: true
 *           example:
 *             menus:
 *               - menuName: Main Menu
 *                 buttons:
 *                   - buttonName: Button 1
 *                   - buttonName: Button 2
 *               - menuName: Secondary Menu
 *                 buttons:
 *                   - buttonName: Button A
 *                   - buttonName: Button B
 *     responses:
 *       200:
 *         description: Menu created successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               description: Indicates if the request was successful
 *               example: true
 *             message:
 *               type: string
 *               description: Message indicating success
 *               example: MENU_ADDED_SUCC
 *             data: []
 *       400:
 *         description: Data missing
 *         examples:
 *           application/json:
 *             error: true
 *             data: null
 *             message: DATA_MISSING
 *       500:
 *         description: Internal server error
 *         examples:
 *           application/json:
 *             error: true
 *             data: null
 *             message: SERVER_ERROR
 */

/**
 * @swagger
 * /menu/update-menu/{id}:
 *   patch:
 *     tags:
 *       - Menu
 *     summary: Update an existing menu by ID
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the menu to update
 *         required: true
 *         schema:
 *           type: integer
 *       - in: body
 *         name: body
 *         description: Data for updating the menu
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: New name of the menu
 *             actionId:
 *               type: string
 *               description: New action ID of the menu
 *             buttons:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the button (for updating existing buttons)
 *                   name:
 *                     type: string
 *                     description: New name of the button
 *                   actionId:
 *                     type: string
 *                     description: New action ID of the button
 *             idsDeleted:
 *               type: array
 *               items:
 *                 type: integer
 *               description: IDs of the buttons to delete
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               description: Indicates if the request was successful
 *               example: true
 *             message:
 *               type: string
 *               description: Message indicating success
 *               example: MENU_UPDATED_SUCC
 *             data:
 *               type: object
 *               description: Data of the updated menu
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 actionId:
 *                   type: string
 *                 buttons:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       actionId:
 *                         type: string
 *       400:
 *         description: Data missing or validation error
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             message:
 *               type: string
 *               example: DATA_MISSING
 *             data:
 *               type: null
 *       404:
 *         description: Menu not found
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             message:
 *               type: string
 *               example: MENU_NOT_FOUND
 *             data:
 *               type: null
 *       500:
 *         description: Internal server error
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             message:
 *               type: string
 *               example: INTERNAL_SERVER_ERROR
 *             data:
 *               type: null
 */

/**
 * @swagger
 * /menu/delete-menu/{id}:
 *   delete:
 *     tags:
 *       - Menu
 *     summary: Delete an existing menu by ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the menu to delete
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               description: Indicates if the request was successful
 *               example: true
 *             message:
 *               type: string
 *               description: Message indicating success
 *               example: MENU_DELETED_SUCC
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /menu/all-menus:
 *   get:
 *     tags:
 *       - Menu
 *     summary: Get all menus
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *     responses:
 *       200:
 *         description: Menus fetched successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               description: Indicates if the request was successful
 *               example: true
 *             message:
 *               type: string
 *               description: Message indicating success
 *               example: MENUS_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of menus
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /menu/all-menus-partner:
 *   get:
 *     tags:
 *       - Menu
 *     summary: Get all menus partner
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *     responses:
 *       200:
 *         description: Menus fetched successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               description: Indicates if the request was successful
 *               example: true
 *             message:
 *               type: string
 *               description: Message indicating success
 *               example: MENUS_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of menus
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /menu/all-menus-role/{id}:
 *   get:
 *     tags:
 *       - Menu
 *     summary: Get all menus role
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *       - in: path
 *         name: id
 *         description: ID of role
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Menus fetched successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               description: Indicates if the request was successful
 *               example: true
 *             message:
 *               type: string
 *               description: Message indicating success
 *               example: MENUS_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of menus
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /menu/permessions:
 *   get:
 *     tags:
 *       - Menu
 *     summary: get permessions
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *     responses:
 *       200:
 *         description: Permessions fetched successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               description: Indicates if the request was successful
 *               example: true
 *             message:
 *               type: string
 *               description: Message indicating success
 *               example: MENUS_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of menus
 *       500:
 *         description: Internal server error
 */

menuRoutes.post(Paths.CREATE_MENU, isAuthenticated([ROLES.ADMIN]), createMenus)

menuRoutes.get(Paths.GET_ALL_MENUS, isAuthenticated([ROLES.ADMIN]), getAllMenus)

menuRoutes.patch(Paths.UPDATE_MENU, isAuthenticated([ROLES.ADMIN]), updateMenu)

menuRoutes.delete(Paths.DELETE_MENU, isAuthenticated([ROLES.ADMIN]), deleteMenu)

menuRoutes.get(Paths.GET_ALL_MENUS_PARTNER, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), getAllMenusPartner)

menuRoutes.get(Paths.GET_ALL_MENUS_ROLE, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), getAllMenusRole)

menuRoutes.get(Paths.GET_PERMESSIONS, isAuthenticated([ROLES.EMPLOYEE]), getPermessions)

export default menuRoutes
