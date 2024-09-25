import { Router } from 'express'
// common
import { Paths } from '../common/paths'
import { isAuthenticated } from '../middleware/authentication'
// controllers
import { createRole, deleteRole, getAllRoles, updateRole } from '../controllers/role.controller'
import { ROLES } from '../utils/constant'

const roleRoutes = Router()

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: APIs for Role
 */

/**
 * @swagger
 * /role/create-role:
 *   post:
 *     tags:
 *       - Role
 *     summary: Create a new role with assigned menus and buttons
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
 *         description: Role data for creation
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Name of the role
 *               example: Admin
 *               required: true
 *             menus:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the menu
 *                     example: Dashboard
 *                     required: true
 *                   id:
 *                     type: number
 *                     description: ID of the menu
 *                     example: 1
 *                     required: true
 *                   buttons:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                           description: ID of the button
 *                           example: 101
 *                           required: true
 *                         menuId:
 *                           type: number
 *                           description: ID of the menu
 *                           example: 1
 *                           required: true
 *                         name:
 *                           type: string
 *                           description: Name of the button
 *                           example: View Dashboard
 *                           required: true
 *                         checked:
 *                           type: boolean
 *                           description: Whether the button is checked for this role
 *                           example: true
 *                           required: true
 *           example:
 *             name: Admin
 *             menus:
 *               - name: Dashboard
 *                 id: 1
 *                 buttons:
 *                   - id: 101
 *                     menuId: 1
 *                     name: View Dashboard
 *                     checked: true
 *                   - id: 102
 *                     menuId: 1
 *                     name: Edit Dashboard
 *                     checked: false
 *               - name: Settings
 *                 id: 2
 *                 buttons:
 *                   - id: 201
 *                     menuId: 2
 *                     name: General Settings
 *                     checked: true
 *                   - id: 202
 *                     menuId: 2
 *                     name: Advanced Settings
 *                     checked: true
 *     responses:
 *       200:
 *         description: Role created successfully
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
 *               example: ROLE_ADDED_SUCC
 *             data:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the created role
 *                 name:
 *                   type: string
 *                   description: Name of the role
 *       400:
 *         description: Data missing or validation error
 *         examples:
 *           application/json:
 *             success: false
 *             message: DATA_MISSING
 *             data: null
 *       500:
 *         description: Internal server error
 *         examples:
 *           application/json:
 *             success: false
 *             message: SERVER_ERROR
 *             data: null
 */

/**
 * @swagger
 * /role/delete-role/{id}:
 *   delete:
 *     tags:
 *       - Role
 *     summary: Delete an existing role by ID
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
 *         description: ID of the role to delete
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: role deleted successfully
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
 *               example: ROLE_DELETED_SUCC
 *       404:
 *         description: role not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /role/all-roles:
 *   get:
 *     tags:
 *       - Role
 *     summary: Get all roles
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
 *         description: roles fetched successfully
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
 *               example: ROLES_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of roles
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /role/update-role/{id}:
 *   patch:
 *     tags:
 *       - Role
 *     summary: Update an existing role with assigned menus and buttons
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
 *       - in: path
 *         name: id
 *         description: ID of the role to update
 *         required: true
 *         type: integer
 *       - in: body
 *         name: menus
 *         description: Role data for updating
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Name of the role
 *               example: Admin
 *               required: true
 *             menus:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the menu
 *                     example: Dashboard
 *                     required: true
 *                   id:
 *                     type: number
 *                     description: ID of the menu
 *                     example: 1
 *                     required: true
 *                   buttons:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                           description: ID of the button
 *                           example: 101
 *                           required: true
 *                         menuId:
 *                           type: number
 *                           description: ID of the menu
 *                           example: 1
 *                           required: true
 *                         name:
 *                           type: string
 *                           description: Name of the button
 *                           example: View Dashboard
 *                           required: true
 *                         checked:
 *                           type: boolean
 *                           description: Whether the button is checked for this role
 *                           example: true
 *                           required: true
 *           example:
 *             name: Admin
 *             menus:
 *               - name: Dashboard
 *                 id: 1
 *                 buttons:
 *                   - id: 101
 *                     menuId: 1
 *                     name: View Dashboard
 *                     checked: true
 *                   - id: 102
 *                     menuId: 1
 *                     name: Edit Dashboard
 *                     checked: false
 *               - name: Settings
 *                 id: 2
 *                 buttons:
 *                   - id: 201
 *                     menuId: 2
 *                     name: General Settings
 *                     checked: true
 *                   - id: 202
 *                     menuId: 2
 *                     name: Advanced Settings
 *                     checked: true
 *     responses:
 *       200:
 *         description: Role updated successfully
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
 *               example: ROLE_UPDATED_SUCC
 *             data:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the updated role
 *                 name:
 *                   type: string
 *                   description: Name of the role
 *       400:
 *         description: Data missing or validation error
 *         examples:
 *           application/json:
 *             success: false
 *             message: DATA_MISSING
 *             data: null
 *       404:
 *         description: Role not found
 *         examples:
 *           application/json:
 *             success: false
 *             message: ROLE_NOT_FOUND
 *             data: null
 *       500:
 *         description: Internal server error
 *         examples:
 *           application/json:
 *             success: false
 *             message: SERVER_ERROR
 *             data: null
 */

roleRoutes.post(Paths.CREATE_ROLE, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), createRole)

roleRoutes.get(Paths.GET_ALL_ROLES, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), getAllRoles)

roleRoutes.delete(Paths.DELETE_ROLE, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), deleteRole)

roleRoutes.patch(Paths.UPDATE_ROLE, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), updateRole)

export default roleRoutes
