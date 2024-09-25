import { Router } from 'express'
// common
import { Paths } from '../common/paths'
import { isAuthenticated } from '../middleware/authentication'
// controllers
import {
    addEmailErp,
    changePassword,
    createEmployee,
    deleteUser,
    editProfile,
    getAllUsers,
    getUser,
    getUserData,
    updateUser
} from '../controllers/user.controller'
import { ROLES } from '../utils/constant'
import multer from 'multer'
const upload = multer()

const userRoutes = Router()

/**
 * @swagger
 * tags:
 *   name:  User
 *   description: APIs for User
 */

/**
 * @swagger
 * /user/create-employee:
 *   post:
 *     tags:
 *       - User
 *     summary: Create Employee
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *       - in: formData
 *         name: email
 *         description: email
 *         required: true
 *         type: string
 *       - in: formData
 *         name: name
 *         description: name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: phone
 *         description: phone
 *         required: true
 *         type: string
 *       - in: formData
 *         name: roleId
 *         description: role Id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: userCreadted
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: USER_CREATED
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
 * /user/delete-user/{id}:
 *   patch:
 *     tags:
 *       - User
 *     summary: Delete an existing user by ID
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
 *         description: ID of the user to delete
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: user deleted successfully
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
 *               example: USER_DELETED_SUCC
 *       404:
 *         description: user not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/all-users:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all users
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *       - in: query
 *         name: page
 *         description: "Page of users list (optional)"
 *         required: false
 *         type: integer
 *       - in: query
 *         name: itemsPerPage
 *         description: "item per page (optional)"
 *         required: false
 *         type: integer
 *       - in: query
 *         name: typeUser
 *         description: typeUser
 *         required: true
 *         type: string
 *       - in: formData
 *         name: searchKeyword
 *         type: string
 *         required: false
 *         description: searched word "name" (optional)
 *     responses:
 *       200:
 *         description: users fetched successfully
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
 *               example: USERS_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of users
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/update-user/{id}:
 *   patch:
 *     tags:
 *       - User
 *     summary: Update user
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *       - in: formData
 *         name: name
 *         description: name
 *         type: string
 *       - in: formData
 *         name: email
 *         description: email
 *         type: string
 *       - in: formData
 *         name: phone
 *         description: phone
 *         type: string
 *       - in: formData
 *         name: isActive
 *         description: isActive
 *         type: boolean
 *     responses:
 *       200:
 *         description: productUpdated
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: PRODUCT_UPDATED
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
 * /user/edit-profile:
 *   patch:
 *     tags:
 *       - User
 *     summary: Edit profile
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *       - in: formData
 *         name: name
 *         description: name
 *         type: string
 *       - in: formData
 *         name: email
 *         description: email
 *         type: string
 *       - in: formData
 *         name: phone
 *         description: phone
 *         type: string
 *     responses:
 *       200:
 *         description: profileEditedSuccefully
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: PROFILE_EDITED_SUCC
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
 * /user/change-password:
 *   patch:
 *     tags:
 *       - User
 *     summary: Chnage password
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer Token
 *         required: true
 *         type: string
 *         default: "Bearer YOUR_TOKEN_HERE"
 *       - in: formData
 *         name: oldPassword
 *         description: Old password
 *         type: string
 *       - in: formData
 *         name: newPassword
 *         description: New password
 *         type: string
 *     responses:
 *       200:
 *         description: passwordchnagedSuccessfully
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: PASSWORD_CHANGED_SUCC
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
 * /user/get-user:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user
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
 *         description: ID of the user
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: user fetched successfully
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
 *               example: USER_FETCHED_SUCC
 *             data:
 *               type: object
 *               description: object of user
 *       500:
 *         description: Internal server error
 */

userRoutes.post(Paths.CREATE_EMPLOYEE, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), createEmployee)

userRoutes.patch(Paths.DELETE_USER, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), deleteUser)

userRoutes.get(Paths.GET_ALL_USERS, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), getAllUsers)

userRoutes.patch(Paths.UPDATE_USER, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), updateUser)

userRoutes.patch(
    Paths.EDIT_PROFILE,
    isAuthenticated([ROLES.EMPLOYEE, ROLES.CLIENT, ROLES.PARTNER]),
    upload.single('image'),
    editProfile
)

userRoutes.patch(Paths.CHANGE_PASSWORD, isAuthenticated([ROLES.EMPLOYEE, ROLES.CLIENT, ROLES.PARTNER]), changePassword)

userRoutes.get(Paths.GET_USER, isAuthenticated([ROLES.PARTNER, ROLES.CLIENT, ROLES.EMPLOYEE]), getUser)

userRoutes.get(Paths.GET_USER_DATA, isAuthenticated([ROLES.PARTNER, ROLES.CLIENT, ROLES.EMPLOYEE]), getUserData)

userRoutes.patch(Paths.ADD_EMAIL_ERP, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), addEmailErp)

export default userRoutes
