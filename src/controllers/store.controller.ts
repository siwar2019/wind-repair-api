import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import { errorServerResponse, sendApiResponse, validateSchema } from '../common/functions'
import * as yup from 'yup'
import { Store } from '../models/store.model'
import { Op } from 'sequelize'
import { sequelize } from '../config/db'
import { SubStore } from '../models/subStore.model'
import { Product } from '../models/product.model'
dotenv.config()

const createStoreSchema = yup.object().shape({
    stores: yup
        .array()
        .of(
            yup.object().shape({
                id: yup.number(),
                name: yup.string().required(),
                nbrLines: yup.number().required(),
                columns: yup.array().of(yup.string().required()).required()
            })
        )
        .required()
})

const createStore = async (req: Request, res: Response) => {
    const { stores } = req.body
    const user = req.user
    const transaction = await sequelize.transaction()
    try {
        await validateSchema(createStoreSchema, req.body)

        if (!user) {
            return sendApiResponse(res, 400, MSG.NO_TOKEN, null)
        }

        const storeErrors = []

        for (const store of stores) {
            if (store.id !== -1) {
                continue
            }

            const existingStore = await Store.findOne({
                where: {
                    [Op.or]: [{ name: store.name }]
                }
            })

            if (existingStore) {
                storeErrors.push({ name: store.name, error: MSG.STORE_ALREADY_EXISTS })
                continue
            }

            const newStore = await Store.create(
                {
                    name: store.name,
                    userId: user.tenantId || user.id,
                    columns: store.columns,
                    nbrLines: store.nbrLines
                },
                { transaction }
            )

            const subStores = store.columns.flatMap((column: string) =>
                Array.from({ length: store.nbrLines }, (_, i) =>
                    SubStore.create(
                        {
                            name: `${column}${i + 1}`,
                            storeId: newStore.id
                        },
                        { transaction }
                    )
                )
            )

            await Promise.all(subStores)
        }
        if (storeErrors.length > 0) {
            await transaction.rollback()
            return sendApiResponse(res, 400, MSG.STORE_ALREADY_EXISTS, null)
        }

        await transaction.commit()

        const data = await Store.findAll({
            include: [
                {
                    model: SubStore,
                    as: 'subStores'
                }
            ],
            order: [['id', 'ASC']]
        })

        return sendApiResponse(res, 200, MSG.STORE_ADDED_SUCC, data)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            if (error instanceof yup.ValidationError) {
                return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
            } else {
                console.error('Error create store:', error)
                return errorServerResponse(res)
            }
        }
    }
}

const getStores = async (req: Request, res: Response) => {
    const user = req.user
    try {
        if (!user) {
            return sendApiResponse(res, 400, MSG.NO_TOKEN, null)
        }
        const stores = await Store.findAll({
            where: { userId: user.tenantId || user.id },
            order: [['id', 'ASC']],
            include: [{ model: SubStore, as: 'subStores', include: [{ model: Product, as: 'products' }] }]
        })

        const formattedStores = stores.map((store) => ({
            ...store.toJSON(),
            subStores: store.subStores.map((subStore: SubStore) => ({
                id: subStore.id,
                name: subStore.name,
                productCount: subStore.products.length,
                productNames: subStore.products.map((product: Product) => product.model)
            }))
        }))

        return sendApiResponse(res, 200, MSG.STORES_FETCHED_SUCC, formattedStores)
    } catch (error) {
        console.error('Error fetching stores:', error)
        return errorServerResponse(res)
    }
}

const getDetailsStore = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = req.user

    try {
        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const store = await Store.findOne({
            where: { id, userId: user.id },
            include: [
                {
                    model: SubStore,
                    as: 'subStores',
                    attributes: ['name', 'id'],
                    include: [
                        {
                            model: Product,
                            as: 'products',
                            attributes: ['name']
                        }
                    ]
                }
            ]
        })

        if (!store) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        const formattedStore = {
            ...store.toJSON(),
            subStores: store.subStores.map((subStore: SubStore) => ({
                id: subStore.id,
                name: subStore.name,
                productCount: subStore.products.length,
                productNames: subStore.products.map((product: Product) => product.model)
            }))
        }

        return sendApiResponse(res, 200, MSG.STORES_FETCHED_SUCC, formattedStore)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching product:', error)
            return errorServerResponse(res)
        }
    }
}

export { createStore, getStores, getDetailsStore }
