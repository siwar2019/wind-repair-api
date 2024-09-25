import { Router } from 'express'
// common
import { Paths } from '../common/paths'
import { isAuthenticated } from '../middleware/authentication'
//controller
import {
    assignProduct,
    createProduct,
    deleteProduct,
    getAllProduct,
    getProduct,
    updateProduct
} from '../controllers/product.controller'
import { ROLES } from '../utils/constant'

const productRoutes = Router()

/**
 * @swagger
 * tags:
 *   name:  Product
 *   description: APIs for Product
 */

/**
 * @swagger
 * /product/create-product:
 *   post:
 *     tags:
 *       - Product
 *     summary: Create product
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
 *         name: serialNumber
 *         description: serialNumber
 *         required: true
 *         type: string
 *       - in: formData
 *         name: name
 *         description: name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: model
 *         description: model
 *         required: true
 *         type: string
 *       - in: formData
 *         name: problemDescription
 *         description: problemDescription
 *         required: true
 *         type: string
 *       - in: formData
 *         name: name
 *         description: name of the client
 *         required: true
 *         type: string
 *       - in: formData
 *         name: email
 *         description: email of the client
 *         type: string
 *       - in: formData
 *         name: phone
 *         description: phone of the client
 *         required: true
 *         type: string
 *       - in: formData
 *         name: password
 *         description: password of the client
 *         required: true
 *         type: string
 *       - in: formData
 *         name: estimatedCost
 *         description: estimated Cost
 *         required: true
 *         type: number
 *       - in: formData
 *         name: estimatedTime
 *         description: estimated Time
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: productCreadted
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: PRODUCT_CREATED
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
 * /product/update-product/{id}:
 *   patch:
 *     tags:
 *       - Product
 *     summary: Update product
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
 *         name: serialNumber
 *         description: nameserialNumber
 *         type: string
 *       - in: formData
 *         name: name
 *         description: name
 *         type: string
 *       - in: formData
 *         name: model
 *         description: model
 *         type: string
 *       - in: formData
 *         name: problemDescription
 *         description: problemDescription
 *         type: string
 *       - in: formData
 *         name: status
 *         description: status of the product
 *         type: string
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
 * /product/assign-product/{id}:
 *   patch:
 *     tags:
 *       - Product
 *     summary: assign product
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
 *     responses:
 *       200:
 *         description: productAssigned
 *         examples:
 *           application/json:
 *             data: null
 *             success: true
 *             message: PRODUCT_ASSIGNED
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
 * /product/delete-product/{id}:
 *   delete:
 *     tags:
 *       - Product
 *     summary: Delete an existing product by ID
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
 *         description: ID of the product to delete
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: product deleted successfully
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
 *               example: PRODUCT_DELETED_SUCC
 *       404:
 *         description: product not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /product/all-products:
 *   get:
 *     tags:
 *       - Product
 *     summary: Get all products
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
 *         description: "Page of products list (optional)"
 *         required: false
 *         type: integer
 *       - in: query
 *         name: itemsPerPage
 *         description: "item per page (optional)"
 *         required: false
 *         type: integer
 *     responses:
 *       200:
 *         description: Products fetched successfully
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
 *               example: PRODUCTS_FETCHED_SUCC
 *             data:
 *               type: array
 *               description: Array of products
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /product/get-product/{id}:
 *   get:
 *     tags:
 *       - Product
 *     summary: Get product
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
 *         description: Product fetched successfully
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
 *               example: PRODUCT_FETCHED_SUCC
 *             data:
 *               type: object
 *               description: product
 *       500:
 *         description: Internal server error
 */

productRoutes.post(Paths.CREATE_PRODUCT, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), createProduct)

productRoutes.patch(Paths.UPDATE_PRODUCT, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), updateProduct)

productRoutes.patch(Paths.ASSIGN_PRODUCT, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), assignProduct)

productRoutes.delete(Paths.DELETE_PRODUCT, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), deleteProduct)

productRoutes.get(Paths.GET_ALL_PRODUCTS, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER, ROLES.CLIENT]), getAllProduct)

productRoutes.get(Paths.GET_PRODUCT, isAuthenticated([ROLES.EMPLOYEE, ROLES.PARTNER]), getProduct)

export default productRoutes
