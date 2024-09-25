import { Request, Response } from 'express'
import fs from 'fs'
// config
import { sequelize } from '../../../config/db'
import { User } from '../../../models/user.model'
import { faker } from '@faker-js/faker'
import { expectResponse } from '../../helpers/commonFunctions'
import { MSG } from '../../../common/responseMessages'
import bcrypt from 'bcrypt'
import { Type } from '../../../models/type.model'
import { Role } from '../../../models/role.model'
import { ROLES } from '../../../utils/constant'
import { createProduct, deleteProduct, getAllProduct, updateProduct } from '../../../controllers/product.controller'
import { Product } from '../../../models/product.model'

let mockRequest: Partial<Request>
let mockResponse: Partial<Response>
let mockRole: Role | null
let mockPartner: User | null
let responseObject: ResponseType
let mockTypePartner: Type | null
let mockTypeClient: Type | null
let mockTypeEmployee: Type | null

beforeAll(async () => {
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockImplementation((result) => {
            responseObject = result
        })
    }
    await sequelize.sync()
})

beforeEach(async () => {
    try {
        mockTypePartner = await Type.create({
            name: ROLES.PARTNER
        })

        mockTypeClient = await Type.create({
            name: ROLES.CLIENT
        })

        mockTypeEmployee = await Type.create({
            name: ROLES.EMPLOYEE
        })

        mockPartner = await User.create({
            email: faker.internet.email(),
            password: bcrypt.hashSync(faker.internet.password(), 10),
            companyName: faker.company.name(),
            phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
            isActive: true,
            isDeleted: false,
            typeId: mockTypePartner.id,
            tenantId: null
        })

        mockRole = await Role.create({
            name: 'technician',
            createdBy: mockPartner.id
        })
    } catch (error) {
        console.log(error, error)
    }
})

afterAll(async () => {
    const sqlitePath = sequelize.options.storage as string
    await sequelize.close()

    await new Promise((resolve) => setTimeout(resolve, 100))

    if (fs.existsSync(sqlitePath)) {
        try {
            fs.unlinkSync(sqlitePath)
        } catch (error: any) {
            console.error(`Failed to delete test database file: ${(error as Error).message}`)
        }
    }
})

describe('create employee', () => {
    const product = {
        serialNumber: faker.string.alphanumeric({ length: 8 }),
        name: faker.commerce.product(),
        model: faker.commerce.product(),
        problemDescription: 'problem',
        customerName: faker.person.firstName(),
        phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
        email: faker.internet.email(),
        estimatedCost: 10,
        estimatedTime: 10,
        description: 'description'
    }
    test('should return 200 if employee created with success', async () => {
        if (mockPartner && mockRole) {
            mockRequest = {
                body: {
                    serialNumber: product.serialNumber,
                    name: product.name,
                    model: product.model,
                    problemDescription: product.problemDescription,
                    customerName: product.customerName,
                    phone: product.phone,
                    email: product.email,
                    estimatedCost: product.estimatedCost,
                    estimatedTime: product.estimatedTime,
                    description: product.description,
                    user: {
                        id: mockPartner.toJSON().id,
                        tenantId: mockPartner.toJSON().tenantId
                    }
                }
            }

            await createProduct(mockRequest as Request, mockResponse as Response)

            const receivedMessage = (mockResponse!.send as jest.Mock).mock.calls[0][0].message
            const receivedSuccess = (mockResponse!.send as jest.Mock).mock.calls[0][0].success
            const receivedData = (mockResponse!.send as jest.Mock).mock.calls[0][0].success

            //tests
            expect(mockResponse.status).toHaveBeenCalledWith(200)
            expect(receivedMessage).toEqual(MSG.PRODUCT_CREATED)
            expect(receivedSuccess).toEqual(true)
            expect(receivedData).not.toEqual(null)
        }
    })

    test('should return status 400 if request body is missing data', async () => {
        // Missing 'serialNumber' field in the request body
        if (mockPartner && mockTypePartner) {
            mockRequest = {
                body: {
                    serialNumber: product.serialNumber,
                    problemDescription: product.problemDescription,
                    name: product.name,
                    phone: product.phone,
                    email: product.email,
                    estimatedCost: product.estimatedCost,
                    estimatedTime: product.estimatedTime,
                    description: product.description,
                    user: {
                        id: mockPartner.toJSON().id,
                        tenantId: mockPartner.toJSON().tenantId
                    }
                }
            }

            await createProduct(mockRequest as Request, mockResponse as Response)

            expectResponse(mockResponse, 400, false, MSG.DATA_MISSING, null)
        }
    })
})

describe('update Product', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })
    const product = {
        serialNumber: faker.string.alphanumeric({ length: 8 }),
        name: faker.commerce.product(),
        model: faker.commerce.product(),
        problemDescription: 'problem',
        customername: faker.person.firstName(),
        phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
        email: faker.internet.email(),
        estimatedCost: 10,
        estimatedTime: 10,
        description: 'description'
    }
    test('should update the product', async () => {
        if (mockPartner && mockTypePartner && mockTypeClient) {
            const mockUser = await User.create({
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                name: faker.person.firstName(),
                typeId: mockTypeClient.id,
                tenantId: mockPartner.id
            })
            const mockProduct = await Product.create({
                serialNumber: product.serialNumber,
                name: product.name,
                model: product.model,
                clientId: mockUser.id,
                problemDescription: product.problemDescription,
                estimatedCost: product.estimatedCost,
                estimatedTime: product.estimatedTime,
                description: product.description,
                partnerId: mockPartner.id
            })

            mockRequest = {
                params: { id: mockProduct.toJSON().id },
                body: {
                    user: {
                        id: mockPartner.toJSON().id,
                        tenantId: mockPartner.toJSON().tenantId
                    }
                }
            }

            await updateProduct(mockRequest as Request, mockResponse as Response)

            const updatedProduct = await Product.findOne({
                order: [['updatedAt', 'DESC']],
                where: { id: mockProduct.toJSON().id }
            })

            expectResponse(mockResponse, 200, true, MSG.PRODUCT_UPDATED, updatedProduct)
        }
    })

    test('should return 404 if product not found', async () => {
        if (mockPartner && mockTypePartner && mockTypeClient) {
            mockRequest = {
                params: { id: '111' },
                body: {
                    user: {
                        id: mockPartner.toJSON().id,
                        tenantId: mockPartner.toJSON().tenantId
                    }
                }
            }

            await updateProduct(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 404, false, MSG.NOT_FOUND, null)
        }
    })

    test('should return 400 if id not valid', async () => {
        if (mockPartner && mockTypePartner && mockTypeClient) {
            mockRequest = {
                params: { id: '' },
                body: {
                    user: {
                        id: mockPartner.toJSON().id,
                        tenantId: mockPartner.toJSON().tenantId
                    }
                }
            }

            await updateProduct(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.INVALID_ID, null)
        }
    })

    test('should return 400 if data missed', async () => {
        if (mockPartner && mockTypePartner && mockTypeClient) {
            mockRequest = {
                params: { id: '1' },
                body: {}
            }

            await updateProduct(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.DATA_MISSING, null)
        }
    })
})

describe('assign Product', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })
    const product = {
        serialNumber: faker.string.alphanumeric({ length: 8 }),
        name: faker.commerce.product(),
        model: faker.commerce.product(),
        problemDescription: 'problem',
        customerName: faker.person.firstName(),
        phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
        email: faker.internet.email(),
        estimatedCost: 10,
        estimatedTime: 10,
        description: 'description'
    }
    test('should assign the product to an employee', async () => {
        if (mockPartner && mockTypeEmployee) {
            const mockUser = await User.create({
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                name: faker.person.firstName(),
                typeId: mockTypeEmployee.id,
                tenantId: mockPartner.id
            })
            const mockProduct = await Product.create({
                serialNumber: product.serialNumber,
                name: product.name,
                model: product.model,
                clientId: mockUser.id,
                problemDescription: product.problemDescription,
                estimatedCost: product.estimatedCost,
                estimatedTime: product.estimatedTime,
                description: product.description,
                partnerId: mockPartner.id
            })

            mockRequest = {
                params: { id: mockProduct.toJSON().id },
                body: {
                    user: {
                        id: mockUser.toJSON().id,
                        tenantId: mockUser.toJSON().tenantId
                    }
                }
            }

            await updateProduct(mockRequest as Request, mockResponse as Response)

            const updatedProduct = await Product.findOne({
                order: [['updatedAt', 'DESC']],
                where: { id: mockProduct.toJSON().id }
            })

            expectResponse(mockResponse, 200, true, MSG.PRODUCT_UPDATED, updatedProduct)
        }
    })

    test('should return 404 if product not found', async () => {
        if (mockPartner && mockTypeEmployee) {
            const mockUser = await User.create({
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                name: faker.person.firstName(),
                typeId: mockTypeEmployee.id,
                tenantId: mockPartner.id
            })
            mockRequest = {
                params: { id: '111' },
                body: {
                    user: {
                        id: mockUser.toJSON().id,
                        tenantId: mockUser.toJSON().tenantId
                    }
                }
            }

            await updateProduct(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 404, false, MSG.NOT_FOUND, null)
        }
    })

    test('should return 400 if id not valid', async () => {
        if (mockPartner && mockTypeEmployee) {
            const mockUser = await User.create({
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                name: faker.person.firstName(),
                typeId: mockTypeEmployee.id,
                tenantId: mockPartner.id
            })
            mockRequest = {
                params: { id: '' },
                body: {
                    user: {
                        id: mockUser.toJSON().id,
                        tenantId: mockUser.toJSON().tenantId
                    }
                }
            }

            await updateProduct(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.INVALID_ID, null)
        }
    })

    test('should return 400 if data missed', async () => {
        if (mockPartner && mockTypeEmployee) {
            mockRequest = {
                params: { id: '1' },
                body: {}
            }

            await updateProduct(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.DATA_MISSING, null)
        }
    })
})

describe('remove Product', () => {
    const product = {
        serialNumber: faker.string.alphanumeric({ length: 8 }),
        name: faker.commerce.product(),
        model: faker.commerce.product(),
        problemDescription: 'problem',
        customerName: faker.person.firstName(),
        phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
        email: faker.internet.email(),
        estimatedCost: 10,
        estimatedTime: 10,
        description: 'description'
    }
    test('should return 200 if product deleted with success', async () => {
        if (mockPartner && mockTypeEmployee) {
            const mockUser = await User.create({
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                name: faker.person.firstName(),
                typeId: mockTypeEmployee.id,
                tenantId: mockPartner.id
            })
            const mockProduct = await Product.create({
                serialNumber: product.serialNumber,
                name: product.name,
                model: product.model,
                clientId: mockUser.id,
                problemDescription: product.problemDescription,
                estimatedCost: product.estimatedCost,
                estimatedTime: product.estimatedTime,
                description: product.description,
                partnerId: mockPartner.id
            })
            mockRequest = {
                params: { id: mockProduct.toJSON().id },
                body: {
                    user: {
                        id: mockPartner.toJSON().id,
                        tenantId: mockPartner.toJSON().tenantId
                    }
                }
            }

            await deleteProduct(mockRequest as Request, mockResponse as Response)

            expectResponse(mockResponse, 200, true, MSG.PRODUCT_DELETED_SUCC, null)
        }
    })

    test('should return 400 if data missed', async () => {
        mockRequest = {
            params: { id: '1' },
            body: {}
        }

        await deleteProduct(mockRequest as Request, mockResponse as Response)
        expectResponse(mockResponse, 400, false, MSG.DATA_MISSING, null)
    })

    test('should return 404 if product not found', async () => {
        if (mockPartner && mockTypeEmployee) {
            const mockUser = await User.create({
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                name: faker.person.firstName(),
                typeId: mockTypeEmployee.id,
                tenantId: mockPartner.id
            })
            mockRequest = {
                params: { id: '111' },
                body: {
                    user: {
                        id: mockUser.toJSON().id,
                        tenantId: mockUser.toJSON().tenantId
                    }
                }
            }

            await deleteProduct(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 404, false, MSG.NOT_FOUND, null)
        }
    })

    test('should return 400 if id not valid', async () => {
        if (mockPartner && mockTypeEmployee) {
            const mockUser = await User.create({
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                name: faker.person.firstName(),
                typeId: mockTypeEmployee.id,
                tenantId: mockPartner.id
            })
            mockRequest = {
                params: { id: '' },
                body: {
                    user: {
                        id: mockUser.toJSON().id,
                        tenantId: mockUser.toJSON().tenantId
                    }
                }
            }

            await deleteProduct(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.INVALID_ID, null)
        }
    })
})

describe('getAllProducts', () => {
    afterEach(async () => {
        jest.clearAllMocks()
    })

    test('should return products data successfully', async () => {
        if (mockPartner) {
            mockRequest = {
                query: { page: '1', itemsPerPage: '10' },
                body: {
                    user: {
                        id: mockPartner.toJSON().id
                    }
                }
            }

            const expectedStatusCode = 200

            await getAllProduct(mockRequest as Request, mockResponse as Response)

            expect(mockResponse.status).toHaveBeenCalledWith(expectedStatusCode)
        }
    })

    test('should return 400 if data missed', async () => {
        mockRequest = {
            query: { page: '1', itemsPerPage: '10' },
            body: {}
        }

        await getAllProduct(mockRequest as Request, mockResponse as Response)
        expectResponse(mockResponse, 400, false, MSG.DATA_MISSING, null)
    })
})
