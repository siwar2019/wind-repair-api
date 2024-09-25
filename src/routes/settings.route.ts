import { Router } from 'express'
// common
import { Paths } from '../common/paths'
import { isAuthenticated } from '../middleware/authentication'
import { ROLES } from '../utils/constant'
// controllers
import {
    confirmBL,
    createDelivery,
    createErpSetting,
    createSettings,
    getAllCategoryAndProducts,
    getAllDelivery,
    getAllSettings,
    getAuthTokenErp,
    getCategoryAndProductByName,
    getSellingDate,
    getSetting,
    payDelivery,
    updateSettings
} from '../controllers/settings.controller'

const settingsRoutes = Router()

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: APIs for Type
 */

/**
 * @swagger
 * /settings/create:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Create Settings
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
 *         required: true
 *         type: string
 *       - in: formData
 *         name: endPoint
 *         description: endPoint
 *         required: true
 *         type: string
 *       - in: formData
 *         name: params
 *         description: params
 *         required: true
 *         type: string
 *       - in: formData
 *         name: paramsValue
 *         description: paramsValue
 *         type: string
 *       - in: formData
 *         name: pathToGuarantee
 *         description: pathToGuarantee
 *         required: true
 *         type: string
 *       - in: formData
 *         name: pathToSaleDate
 *         description: pathToSaleDate
 *         required: true
 *         type: string
 *       - in: formData
 *         name: output
 *         description: output
 *         required: true
 *         type: string
 *       - in: formData
 *         name: authEndPoint
 *         description: authEndPoint
 *         required: true
 *         type: string
 *       - in: formData
 *         name: username
 *         description: username
 *         required: true
 *         type: string
 *       - in: formData
 *         name: password
 *         description: password
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: settingsCreadted
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: SETTINGS_CREATED
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
 * /settings/update/{id}:
 *   patch:
 *     tags:
 *       - Settings
 *     summary: Update Settings
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
 *       - in: path
 *         name: id
 *         description: ID of settings
 *         required: true
 *         type: integer
 *       - in: formData
 *         name: name
 *         description: name
 *         type: string
 *       - in: formData
 *         name: endPoint
 *         description: endPoint
 *         type: string
 *       - in: formData
 *         name: params
 *         description: params
 *         type: string
 *       - in: formData
 *         name: paramsValue
 *         description: paramsValue
 *         type: string
 *       - in: formData
 *         name: pathToGuarantee
 *         description: pathToGuarantee
 *         type: string
 *       - in: formData
 *         name: pathToSaleDate
 *         description: pathToSaleDate
 *         type: string
 *       - in: formData
 *         name: output
 *         description: output
 *         type: string
 *       - in: formData
 *         name: authEndPoint
 *         description: authEndPoint
 *         type: string
 *       - in: formData
 *         name: username
 *         description: username
 *         type: string
 *       - in: formData
 *         name: password
 *         description: password
 *         type: string
 *     responses:
 *       200:
 *         description: settingsUpdated
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: SETTINGS_UPDATED
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
 * /settings/get-setting/{id}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get setting
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
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Setting fetched successfully
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
 *               example: SETTING_FETCHED_SUCC
 *             data:
 *               type: object
 *               description: setting
 *       500:
 *         description: Internal server error
 */

settingsRoutes.post(Paths.CREATE_SETTINGS, isAuthenticated([ROLES.PARTNER]), createSettings)
settingsRoutes.patch(Paths.UPDATE_SETTINGS, isAuthenticated([ROLES.PARTNER]), updateSettings)
settingsRoutes.get(Paths.GET_SETTING, isAuthenticated([ROLES.PARTNER]), getSetting)
settingsRoutes.get(Paths.GET_ALL_SETTINGS, isAuthenticated([ROLES.PARTNER]), getAllSettings)
settingsRoutes.post(Paths.GET_TOKEN_ERP, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), getAuthTokenErp)
settingsRoutes.get(
    Paths.GET_ALL_CATEGORY_AND_PRODUCTS_ERP,
    isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]),
    getAllCategoryAndProducts
)

settingsRoutes.post(Paths.CREATE_ERP_SETTING, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), createErpSetting)

settingsRoutes.get(Paths.GET_ALL_DELIVERY, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), getAllDelivery)

settingsRoutes.post(Paths.CONFIRM_DELIVERY, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), confirmBL)

settingsRoutes.get(Paths.GET_SELLING_DATE, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), getSellingDate)

settingsRoutes.post(Paths.PAY_DELIVERY, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), payDelivery)

settingsRoutes.post(Paths.CREATE_DELIVERY, isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]), createDelivery)

settingsRoutes.get(
    Paths.GET_ALL_CATEGORY_AND_PRODUCTS_BY_NAME_ERP,
    isAuthenticated([ROLES.PARTNER, ROLES.EMPLOYEE]),
    getCategoryAndProductByName
)

export default settingsRoutes
