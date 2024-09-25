import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { MSG } from '../common/responseMessages'
import { errorServerResponse, getProperty, sendApiResponse, validateSchema } from '../common/functions'
import * as yup from 'yup'
import { Settings } from '../models/settings.model'
import { sequelize } from '../config/db'
import axios from 'axios'
import { EndPointType, TYPE_DELIVERY, TypeParamsSetting, country, currency } from '../utils/constant'
import { FindOptions } from 'sequelize'
import { ParamsSettings } from '../models/paramsSettings.model'
import { Param } from '../interfaces/paramSetting'
import { AxiosConfig } from '../interfaces/axiosConfig'
import { ErpSettings } from '../models/erpSetting.model'
import { User } from '../models/user.model'
dotenv.config()

const paramsSettingsSchema = yup.object().shape({
    name: yup.string().required(),
    type: yup.string().oneOf(Object.values(TypeParamsSetting)).required()
})

const paramsSchema = yup.object().shape({
    id: yup.number().required(),
    value: yup.string().required(),
    name: yup.string().required(),
    type: yup.string().oneOf(Object.values(TypeParamsSetting)).required()
})

const createSettingsSchema = yup.object().shape({
    name: yup.string().required(),
    endPointProd: yup.string().required(),
    endPointTest: yup.string().required(),
    typeEndPoint: yup.string().oneOf(Object.values(EndPointType)).required(),
    paramsSettings: yup.array().of(paramsSettingsSchema),
    path: yup.string(),
    output: yup.string(),
    isAuth: yup.boolean().required(),
    username: yup.string(),
    password: yup.string()
})

const updateSettingsSchema = yup.object().shape({
    name: yup.string(),
    endPointProd: yup.string(),
    endPointTest: yup.string(),
    typeEndPoint: yup.string().oneOf(Object.values(EndPointType)),
    paramsSettings: yup.array().of(paramsSettingsSchema),
    path: yup.string(),
    output: yup.string(),
    isAuth: yup.boolean(),
    username: yup.string(),
    password: yup.string(),
    idsDeleted: yup.array().of(yup.number())
})

const getDetailsErpApiTestSchema = yup.object().shape({
    paramsSettings: yup.array().of(paramsSchema),
    id: yup.number().required()
})

const getErpTokenSchema = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required()
})

const confirmBlSchema = yup.object().shape({
    token: yup.string().required(),
    updatedItemUuid: yup.string().required()
})

const payDeliverySchema = yup.object().shape({
    token: yup.string().required(),
    uuid: yup.string().required()
})

const productSchema = yup.object().shape({
    uuidProduct: yup.string().uuid().required(),
    productInfoDto: yup.mixed().nullable(),
    productname: yup.string().required(),
    quantite: yup.number().required().min(0),
    prixunitaire: yup.number().required().min(0),
    prixtotal: yup.number().required().min(0),
    tvaAmount: yup.number().required().min(0),
    prixnet: yup.number().required().min(0),
    subtotalprice: yup.number().nullable(),
    subtotaldesc: yup.string().nullable(),
    uuidDepot: yup.string().uuid().nullable(),
    uuidVariant: yup.string().uuid().required(),
    remise: yup.number().required().min(0),
    isService: yup.boolean().required(),
    linePurshaseSource: yup.mixed().nullable()
})

const createDeliverySchema = yup.object().shape({
    token: yup.string().required(),
    products: yup.array().of(productSchema)
})

const getAllDeliverySchema = yup.object().shape({
    pageSize: yup.number(),
    pageIndex: yup.number(),
    token: yup.string().required()
})

const createSettings = async (req: Request, res: Response) => {
    const user = req.user
    const { paramsSettings } = req.body
    const transaction = await sequelize.transaction()
    try {
        await validateSchema(createSettingsSchema, req.body)

        if (!user) {
            return sendApiResponse(res, 404, MSG.NO_TOKEN, null)
        }

        const newSetting = await Settings.create(
            {
                ...req.body,
                userId: user.id
            },
            { transaction }
        )

        if (paramsSettings) {
            const paramsCreationPromises = paramsSettings.map((param: ParamsSettings) =>
                ParamsSettings.create(
                    {
                        name: param.name,
                        type: param.type,
                        settingId: newSetting.id
                    },
                    { transaction }
                )
            )
            await Promise.all(paramsCreationPromises)
        }

        await transaction.commit()

        const settingData = await Settings.findOne({
            where: { id: newSetting.id },
            include: [{ model: ParamsSettings, as: 'paramsSettings' }]
        })

        return sendApiResponse(res, 200, MSG.SETTINGS_ADDED_SUCC, settingData)
    } catch (error) {
        await transaction.rollback()
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error create Settings:', error)
            return errorServerResponse(res)
        }
    }
}

const updateSettings = async (req: Request, res: Response) => {
    const user = req.user
    const { id } = req.params
    const { paramsSettings, idsDeleted } = req.body
    const transaction = await sequelize.transaction()
    try {
        await validateSchema(updateSettingsSchema, req.body)

        if (!user) {
            return sendApiResponse(res, 404, MSG.NO_TOKEN, null)
        }

        if (!id) {
            return sendApiResponse(res, 400, MSG.INVALID_ID, null)
        }

        const existingSettings = await Settings.findOne({ where: { id, userId: user.id } })

        if (!existingSettings) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        await existingSettings.update(
            {
                ...req.body
            },
            { transaction }
        )

        if (idsDeleted && idsDeleted.length > 0) {
            await ParamsSettings.destroy({ where: { id: idsDeleted, settingId: id }, transaction })
        }

        if (paramsSettings) {
            const paramsSettingsUpdate = paramsSettings.map(async (param: ParamsSettings) => {
                if (param.id) {
                    const existingParam = await ParamsSettings.findOne({ where: { id: param.id, settingId: id } })
                    if (existingParam) {
                        return existingParam.update(
                            {
                                name: param.name,
                                type: param.type
                            },
                            { transaction }
                        )
                    }
                }
                return ParamsSettings.create(
                    {
                        name: param.name,
                        type: param.type,
                        settingId: id
                    },
                    { transaction }
                )
            })
            await Promise.all(paramsSettingsUpdate)
        }

        await transaction.commit()

        const updatedSetting = await Settings.findOne({
            where: { id },
            include: [
                {
                    model: ParamsSettings,
                    as: 'paramsSettings'
                }
            ]
        })

        return sendApiResponse(res, 200, MSG.SETTINGS_UPDATED_SUCC, updatedSetting)
    } catch (error) {
        await transaction.rollback()
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error update Settings:', error)
            return errorServerResponse(res)
        }
    }
}

const getSetting = async (req: Request, res: Response) => {
    const user = req.user
    const { id } = req.params
    try {
        if (!user) {
            return res.status(400).json({ success: false, message: MSG.NO_TOKEN, data: [] })
        }

        if (!id) {
            return res.status(400).json({ success: false, message: MSG.INVALID_ID, data: [] })
        }

        const setting = await Settings.findOne({
            where: { id, userId: user.id },
            include: [
                {
                    model: ParamsSettings,
                    as: 'paramsSettings'
                }
            ]
        })
        if (!setting) {
            return sendApiResponse(res, 404, MSG.NOT_FOUND, null)
        }

        return sendApiResponse(res, 200, MSG.SETTING_FETCHED_SUCC, setting)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching setting:', error)
            return errorServerResponse(res)
        }
    }
}

const getAuthTokenErp = async (req: Request, res: Response) => {
    const t = await sequelize.transaction()
    const { username, password } = req.body
    const user = req.user

    try {
        await validateSchema(getErpTokenSchema, req.body)
        if (!user) {
            throw new Error(MSG.NO_TOKEN)
        }

        const authData = {
            username: username,
            password: password,
            rememberMe: false
        }
        let authToken

        try {
            const response = await axios.post(`${process.env.BASE_API_ERP}/wind-auth/authenticate`, authData)
            authToken = response.data.access_token
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message)
            } else {
                throw new Error(MSG.ERROR_OCCURRED)
            }
        }

        await t.commit()

        return sendApiResponse(res, 200, MSG.TOKEN_FETCHED_SUCC, authToken)
    } catch (error: any) {
        await t.rollback()
        console.error('Error fetching token:', error)
        return errorServerResponse(res, error.message)
    }
}

const getAllCategoryAndProducts = async (req: Request, res: Response) => {
    const t = await sequelize.transaction()
    const user = req.user
    const { token } = req.params
    try {
        if (!user) {
            throw new Error(MSG.NO_USER)
        }

        if (!token) {
            throw new Error(MSG.NO_TOKEN)
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

        let response

        try {
            response = await axios.get(`${process.env.BASE_API_ERP}/wind-stock/products/getAllCategoryAndProducts`, { headers })
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message)
            } else {
                throw new Error(MSG.ERROR_OCCURRED)
            }
        }

        await t.commit()

        return await sendApiResponse(res, 200, MSG.CATEGORY_AND_PRODUTS_FETCHED_SUCC, response.data)
    } catch (error: any) {
        await t.rollback()
        console.error('Error getting category and products:', error)
        return errorServerResponse(res, error.message)
    }
}

const getDetailsProductErp = async (user: any, authToken: string | null, id: number) => {
    const t = await sequelize.transaction()

    try {
        if (!user) {
            throw new Error(MSG.NO_TOKEN)
        }

        let guaranteeValue
        let saleDateValue

        const existingSettings = await Settings.findOne({ where: { userId: user.tenantId || user.id } })

        if (existingSettings) {
            const headers = {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }

            const response = await axios.get(`${existingSettings.endPointProd}/${id}`, { headers })

            guaranteeValue = getProperty(response.data, existingSettings.path)
            saleDateValue = getProperty(response.data, existingSettings.path)
        }

        const data = {
            guaranteeValue,
            saleDateValue
        }

        await t.commit()

        return data
    } catch (error) {
        await t.rollback()
        if (error instanceof yup.ValidationError) {
            throw new Error(MSG.DATA_MISSING)
        } else {
            console.error('Error fetching product:', error)
            throw error
        }
    }
}

const getDetailsErpApiTest = async (req: Request, res: Response) => {
    const t = await sequelize.transaction()
    const user = req.user
    const { id, paramsSettings } = req.body
    try {
        await validateSchema(getDetailsErpApiTestSchema, req.body)
        if (!user) {
            throw new Error(MSG.NO_TOKEN)
        }

        const existingSettings = await Settings.findOne({ where: { id, userId: user.tenantId || user.id } })

        let response
        let duration

        if (existingSettings) {
            //const authToken = await getAuthTokenErp(user)
            const headers = {
                Authorization: `Bearer`,
                'Content-Type': 'application/json'
            }

            const method = existingSettings.typeEndPoint
            let url = existingSettings.endPointTest
            let data = {}

            if (method === EndPointType.POST || method === EndPointType.PATCH) {
                data = paramsSettings.reduce((acc: any, param: Param) => {
                    acc[param.name] = param.value
                    return acc
                }, {})
            } else {
                const queryParams = paramsSettings.map((param: Param) => `${param.name}=${encodeURIComponent(param.value)}`).join('&')
                url = `${existingSettings.endPointTest}?${queryParams}`
            }

            const startTime = Date.now()

            const axiosConfig: AxiosConfig = {
                method,
                url,
                headers
            }

            if (method === EndPointType.POST || method === EndPointType.PATCH) {
                axiosConfig.data = data
            }

            response = await axios(axiosConfig)

            const endTime = Date.now()
            duration = endTime - startTime
        }

        await t.commit()

        const data = {
            data: response?.data,
            status: response?.status,
            time: duration,
            dataSize: JSON.stringify(response?.data).length
        }

        return sendApiResponse(res, 200, MSG.SETTING_FETCHED_SUCC, data)
    } catch (error) {
        await t.rollback()
        if (error instanceof yup.ValidationError) {
            throw new Error(MSG.DATA_MISSING)
        } else {
            console.error('Error fetching product:', error)
            return errorServerResponse(res)
        }
    }
}

const getAllSettings = async (req: Request, res: Response) => {
    const user = req.user
    try {
        if (!user) {
            return sendApiResponse(res, 400, MSG.NO_TOKEN, null)
        }

        const query: FindOptions = {
            order: [['createdAt', 'DESC']],
            where: {
                userId: user.id
            },
            include: [
                {
                    model: ParamsSettings,
                    as: 'paramsSettings'
                }
            ]
        }

        const settings = await Settings.findAll(query)

        return await sendApiResponse(res, 200, MSG.SETTING_FETCHED_SUCC, settings)
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return sendApiResponse(res, 400, MSG.DATA_MISSING, null)
        } else {
            console.error('Error fetching settings:', error)
            return errorServerResponse(res)
        }
    }
}

const createErpSetting = async (req: Request, res: Response) => {
    const user = req.user
    const transaction = await sequelize.transaction()
    const { token } = req.body
    try {
        if (!user) {
            throw new Error(MSG.NO_USER)
        }

        if (!token) {
            throw new Error(MSG.NO_TOKEN)
        }

        const userData = await User.findOne({ where: { id: user.tenantId || user.id } })

        if (!userData) {
            throw new Error(MSG.NOT_FOUND)
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

        const existingErpSetting = await ErpSettings.findOne({ where: { userId: user.tenantId || user.id } })

        if (!existingErpSetting) {
            throw new Error(MSG.NOT_FOUND)
        }
        let partnerResult
        let customerResult
        let currencyResult
        let compteBancairResult
        let caisseResult
        let bankAccountResult

        if (!existingErpSetting.tenantIdPartner) {
            try {
                partnerResult = await axios.get(`${process.env.BASE_API_ERP}/wind-partner/partners/my-partner`, { headers })
                existingErpSetting.tenantIdPartner = partnerResult.data.tenant_id
                existingErpSetting.uuidPartner = partnerResult.data.uuid
            } catch (error: any) {
                if (error.response && error.response.data) {
                    throw new Error(error.response.data.message)
                } else {
                    throw new Error(MSG.ERROR_OCCURRED)
                }
            }
        }

        if (!existingErpSetting.uuidCustomer) {
            const customerData = {
                country_Code: country,
                country: country,
                name: 'Client Repair',
                alternative_Name: 'Demo',
                nature: 'CLIENT',
                state: 'ACTIVE',
                phone: userData.phone,
                fax: '',
                email: '',
                web: '',
                rc: '',
                capital: null,
                vat_Liable: false,
                vat_Number: '',
                tiersType: null,
                employee: '',
                type_LegEnt: null,
                logo: ''
            }
            try {
                customerResult = await axios.post(`${process.env.BASE_API_ERP}/wind-crm/tiers`, customerData, { headers })
            } catch (error: any) {
                if (error.response && error.response.data) {
                    throw new Error(error.response.data.message)
                } else {
                    throw new Error(MSG.ERROR_OCCURRED)
                }
            }
            existingErpSetting.uuidCustomer = customerResult.data.uuid

            const bankAccountData = {
                accountNumber: '55151561258145814510',
                bank: 'BZ',
                bank_Account_Name: 'courant',
                bic_Code: '84489',
                domiciliation: '58561',
                iban: '545848415811',
                owner_Address: 'TUNIS',
                owner_Name: 'CLIENT',
                tenantId: 0,
                tier: customerResult.data.uuid,
                uuid: ''
            }
            try {
                bankAccountResult = await axios.post(`${process.env.BASE_API_ERP}/wind-crm/bank-accounts`, bankAccountData, {
                    headers
                })
            } catch (error: any) {
                if (error.response && error.response.data) {
                    throw new Error(error.response.data.message)
                } else {
                    throw new Error(MSG.ERROR_OCCURRED)
                }
            }
            existingErpSetting.uuidBankAccountCustomer = bankAccountResult.data.uuid
        }

        if (!existingErpSetting.uuidCurrency) {
            const currencyData = {
                name: 'Dinar Tunisien',
                type: currency
            }

            try {
                currencyResult = await axios.post(`${process.env.BASE_API_ERP}/wind-fund/currencies`, currencyData, { headers })
            } catch (error: any) {
                if (error.response && error.response.data) {
                    throw new Error(error.response.data.message)
                } else {
                    throw new Error(MSG.ERROR_OCCURRED)
                }
            }
            existingErpSetting.uuidCurrency = currencyResult.data.uuid

            const compteBancairData = {
                accountNumber: '99999-99999-99999999999-88',
                ownerName: 'windRepair',
                ownerAddress: '',
                label: `Caisse-${Date.now()}`,
                swift: 4454654656565656611,
                initialAmount: 100,
                minimalAmount: 10,
                accountType: '0',
                state: 'OUVERT',
                currency: {
                    uuid: currencyResult.data.uuid
                },
                bankName: 'BZ',
                accountingAccountCode: '1',
                comment: '22',
                country: 'Tunisie',
                accountDate: new Date(),
                tenantId: existingErpSetting.tenantIdPartner,
                accountingAccount: '101'
            }

            try {
                compteBancairResult = await axios.post(`${process.env.BASE_API_ERP}/wind-fund/bank-accounts-fund`, compteBancairData, {
                    headers
                })
            } catch (error: any) {
                if (error.response && error.response.data) {
                    throw new Error(error.response.data.message)
                } else {
                    throw new Error(MSG.ERROR_OCCURRED)
                }
            }
            existingErpSetting.uuidCompteBancaire = compteBancairResult.data.uuid

            const caisseData = {
                label: `Caisse-Repair-${Date.now()}`,
                bankAccount: compteBancairResult.data.uuid,
                tenantId: existingErpSetting.tenantIdPartner,
                initialAmount: 1000
            }
            try {
                caisseResult = await axios.post(`${process.env.BASE_API_ERP}/wind-fund/caisse`, caisseData, { headers })
            } catch (error: any) {
                if (error.response && error.response.data) {
                    throw new Error(error.response.data.message)
                } else {
                    throw new Error(MSG.ERROR_OCCURRED)
                }
            }
            existingErpSetting.uuidCaisse = caisseResult.data.uuid
        }

        await existingErpSetting.save({ transaction })

        await transaction.commit()

        return sendApiResponse(res, 200, MSG.CUSTOMER_ERP_ADD_SUCC, existingErpSetting)
    } catch (error: any) {
        await transaction.rollback()
        console.error('Error create erp setting', error)
        return errorServerResponse(res, error.message)
    }
}

const getAllDelivery = async (req: Request, res: Response) => {
    const t = await sequelize.transaction()
    const user = req.user
    const { token } = req.params
    const { pageSize, pageIndex } = req.query
    try {
        await validateSchema(getAllDeliverySchema, {
            pageSize,
            pageIndex,
            token
        })
        if (!user) {
            throw new Error(MSG.NO_USER)
        }

        if (!token) {
            throw new Error(MSG.NO_TOKEN)
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

        let response
        try {
            const apiUrl = `${process.env.BASE_API_ERP}/wind-billing/delivery-form/perPage`

            response = await axios.get(apiUrl, {
                headers,
                params: {
                    transactionType: 'VENTE',
                    moduleType: 'STOCK',
                    pageSize: pageSize || 5,
                    pageIndex: pageIndex || 0,
                    sortDirection: 'DESC',
                    sortField: 'created'
                }
            })
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message)
            } else {
                throw new Error(MSG.ERROR_OCCURRED)
            }
        }

        const data = {
            list: response.data.content,
            page: response.data.page,
            itemsPerPage: response.data.pageSize,
            total: response.data.totalElements
        }

        await t.commit()
        return await sendApiResponse(res, 200, MSG.DELIVERY_FETCHED_SUCC, data)
    } catch (error: any) {
        await t.rollback()
        console.error('Error get all delivery:', error)
        return errorServerResponse(res, error.message)
    }
}

const confirmBL = async (req: Request, res: Response) => {
    const t = await sequelize.transaction()
    const user = req.user
    const { updatedItemUuid, token } = req.body
    try {
        await validateSchema(confirmBlSchema, req.body)
        if (!user) {
            throw new Error(MSG.NO_USER)
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
        let response

        try {
            response = await axios.get(
                `${process.env.BASE_API_ERP}/wind-billing/delivery-form/changeStatus?updatedItemUuid=${updatedItemUuid}`,
                { headers }
            )
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message)
            } else {
                throw new Error(MSG.ERROR_OCCURRED)
            }
        }
        await t.commit()

        return await sendApiResponse(res, 200, MSG.DELIVERY_CONFIRMED_SUCC, response.data)
    } catch (error: any) {
        await t.rollback()
        let errorMessage

        if (error instanceof yup.ValidationError) {
            errorMessage = MSG.DATA_MISSING
        } else if (error.message) {
            errorMessage = error.message
        }

        console.error('Error confirm delivery:', error)
        return errorServerResponse(res, errorMessage)
    }
}

const getSellingDate = async (req: Request, res: Response) => {
    const t = await sequelize.transaction()
    const user = req.user
    const { token, code } = req.params
    try {
        if (!user || !code) {
            throw new Error(MSG.DATA_MISSING)
        }
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

        let response

        try {
            response = await axios.get(`${process.env.BASE_API_ERP}/wind-stock/products/getSellingDateByCode?code=${code}`, {
                headers
            })
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message)
            } else {
                throw new Error(MSG.ERROR_OCCURRED)
            }
        }
        await t.commit()

        return await sendApiResponse(res, 200, MSG.SELLING_DATE_FETCHED_SUCC, response.data)
    } catch (error: any) {
        await t.rollback()
        console.error('Error get selling date:', error)
        return errorServerResponse(res, error.message)
    }
}

const payDelivery = async (req: Request, res: Response) => {
    const t = await sequelize.transaction()
    const user = req.user
    const { uuid, token } = req.body
    try {
        await validateSchema(payDeliverySchema, req.body)
        if (!user) {
            throw new Error(MSG.NO_USER)
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
        let delivery
        try {
            delivery = await axios.get(`${process.env.BASE_API_ERP}/wind-billing/delivery-form/${uuid}`, { headers })
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message)
            } else {
                throw new Error(MSG.ERROR_OCCURRED)
            }
        }
        const existingErpSetting = await ErpSettings.findOne({ where: { userId: user.tenantId || user.id } })
        if (!existingErpSetting) {
            throw new Error(MSG.NOT_FOUND)
        }

        let deliveryResult

        const deliveryData = {
            left_to_pay: 0,
            percentage_rs: 0,
            total_payed: delivery.data.totalTtc,
            total_rs: 0,
            transactions: [
                {
                    caisse: existingErpSetting.uuidCaisse,
                    deadlinedate: null,
                    valueDate: new Date(),
                    devise: null,
                    id: 0,
                    infosvirement: '',
                    invoice: delivery.data.uuid,
                    amount: delivery.data.totalTtc,
                    nomtraite: '',
                    numcheque: '',
                    payType: 'CSH',
                    status: 'VALIDE',
                    uuid: '',
                    tier: existingErpSetting.uuidCustomer,
                    refInvoice: delivery.data.invoiceNumber,
                    uuidCollaborator: null,
                    nomPayeur: '',
                    nomBank: '',
                    ripPayeur: '',
                    uuidAvoir: '',
                    isConsumed: false,
                    numDossier: '',
                    description: null
                }
            ],
            sens: 'CREDIT',
            uuidCollaborator: null,
            invoiceUuids: null,
            prelevementActive: false
        }

        try {
            deliveryResult = await axios.post(`${process.env.BASE_API_ERP}/wind-billing/delivery-form/pay-delivery`, deliveryData, {
                headers
            })
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message)
            } else {
                throw new Error(MSG.ERROR_OCCURRED)
            }
        }
        await t.commit()

        return await sendApiResponse(res, 200, MSG.DELIVERY_PAYED_SUCC, deliveryResult.data)
    } catch (error: any) {
        await t.rollback()
        let errorMessage

        if (error instanceof yup.ValidationError) {
            errorMessage = MSG.DATA_MISSING
        } else if (error.message) {
            errorMessage = error.message
        }

        console.error('Error pay delivery:', error)
        return errorServerResponse(res, errorMessage)
    }
}

const createDelivery = async (req: Request, res: Response) => {
    const t = await sequelize.transaction()
    const user = req.user
    const { token, products } = req.body
    try {
        await validateSchema(createDeliverySchema, req.body)
        if (!user) {
            throw new Error(MSG.NO_USER)
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

        const existingErpSetting = await ErpSettings.findOne({ where: { userId: user.tenantId || user.id } })
        if (!existingErpSetting) {
            throw new Error(MSG.NOT_FOUND)
        }

        let deliveryResult

        const invocieNumber = await generateInvoiceNumber(token)
        const deliveryData = {
            invoicetype: TYPE_DELIVERY.VENTE,
            uuidCollaborator: null,
            customer: existingErpSetting.uuidCustomer,
            purchaseType: 'Produit',
            partner: existingErpSetting.uuidPartner,
            invoiceNumber: invocieNumber.number,
            invoiceDate: new Date(),
            model: null,
            status: 'NON_LIVRE',
            taxList: [],
            devis: null,
            purshase_order: null,
            invoice: null,
            type: 'STOCK',
            paymentStatus: 'NON_PAYE',
            isPartial: false,
            isService: false,
            isPaid: false,
            discount: null,
            lineModels: products
        }

        try {
            deliveryResult = await axios.post(
                `${process.env.BASE_API_ERP}/wind-billing/delivery-form/createDeliveryWithPurchase2`,
                deliveryData,
                { headers }
            )
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message)
            } else {
                throw new Error(MSG.ERROR_OCCURRED)
            }
        }
        await t.commit()

        return await sendApiResponse(res, 200, MSG.DELIVERY_CREATED_SUCC, deliveryResult.data)
    } catch (error: any) {
        await t.rollback()
        let errorMessage

        if (error instanceof yup.ValidationError) {
            errorMessage = MSG.DATA_MISSING
        } else if (error.message) {
            errorMessage = error.message
        }

        console.error('Error create delivery:', error)
        return errorServerResponse(res, errorMessage)
    }
}

const getPartnerWithEmail = async (email: string) => {
    try {
        const erpClient = await axios.get(`${process.env.BASE_API_ERP}/wind-partner/partners/getPartnerByEmail/${email}`)
        return erpClient.data
    } catch (error: any) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message)
        } else {
            throw new Error(MSG.ERROR_OCCURRED)
        }
    }
}

const generateInvoiceNumber = async (token: string) => {
    try {
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
        const invoice = await axios.get(
            `${process.env.BASE_API_ERP}/wind-billing/delivery-form/generate-Delivery-Number/${TYPE_DELIVERY.VENTE}`,
            { headers }
        )
        return invoice.data
    } catch (error: any) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message)
        } else {
            throw new Error(MSG.ERROR_OCCURRED)
        }
    }
}

const getCategoryAndProductByName = async (req: Request, res: Response) => {
    const t = await sequelize.transaction()
    const user = req.user
    const { token } = req.params
    try {
        if (!user) {
            throw new Error(MSG.DATA_MISSING)
        }
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

        const userData = await User.findOne({
            where: { id: user.tenantId || user.id }
        })

        if (!userData) {
            throw new Error(MSG.NOT_FOUND)
        }

        if (!userData.nameCategory) {
            throw new Error(MSG.CATEGORY_PRODUCTS_NOT_EXISTS)
        }

        let response

        try {
            response = await axios.get(
                `${process.env.BASE_API_ERP}/wind-stock/products/getAllProductsByCategoryNameForRepair?categoryName=${userData.nameCategory}`,
                { headers }
            )
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message)
            } else {
                throw new Error(MSG.ERROR_OCCURRED)
            }
        }
        await t.commit()

        return await sendApiResponse(res, 200, MSG.CATEGORY_AND_PRODUTS_FETCHED_SUCC, response.data)
    } catch (error: any) {
        await t.rollback()
        console.error('Error get category and products:', error)
        return errorServerResponse(res, error.message)
    }
}

export {
    createSettings,
    updateSettings,
    getDetailsProductErp,
    getAuthTokenErp,
    getSetting,
    getAllSettings,
    getAllCategoryAndProducts,
    getDetailsErpApiTest,
    createErpSetting,
    getAllDelivery,
    confirmBL,
    getSellingDate,
    payDelivery,
    createDelivery,
    getPartnerWithEmail,
    generateInvoiceNumber,
    getCategoryAndProductByName
}
