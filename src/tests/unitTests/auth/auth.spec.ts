import { Request, Response } from 'express'
import fs from 'fs'
// config
import { sequelize } from '../../../config/db'
// controllers
import { login, register } from '../../../controllers/auth.controller'
//common
import { expectResponse } from '../../helpers/commonFunctions'
// utils
import { MSG } from '../../../common/responseMessages'
import { faker } from '@faker-js/faker'
import { User } from '../../../models/user.model'
import { removeUser } from '../../helpers/user'
import { Role } from '../../../models/role.model'
import { Type } from '../../../models/type.model'
import { ROLES } from '../../../utils/constant'
import bcrypt from 'bcrypt'

let mockRequest: Partial<Request>
let mockResponse: Partial<Response>
let mockUser: User | null
let mockPartner: User | null
let responseObject: ResponseType
let mockType: Type | null

beforeAll(async () => {
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockImplementation((result) => {
            responseObject = result
        })
    }
    await sequelize.sync()
})

afterAll(async () => {
    if (mockUser) {
        await removeUser(mockUser.id)
        mockUser = null
    }

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

afterEach(() => {
    jest.clearAllMocks()
})
describe('register', () => {
    const fakePassword = faker.internet.password()
    test('should add a new partner', async () => {
        mockType = await Type.create({
            name: ROLES.PARTNER
        })
        if (mockType) {
            mockRequest = {
                body: {
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                    companyName: faker.company.name(),
                    phone: faker.number.int({ min: 10000000, max: 99999999 }).toString()
                }
            }

            await register(mockRequest as Request, mockResponse as Response)

            const receivedMessage = (mockResponse!.send as jest.Mock).mock.calls[0][0].message
            const receivedSuccess = (mockResponse!.send as jest.Mock).mock.calls[0][0].success
            const receivedData = (mockResponse!.send as jest.Mock).mock.calls[0][0].success

            expect(mockResponse.status).toHaveBeenCalledWith(200)
            expect(receivedMessage).toEqual(MSG.PARTNER_ADDED_SUCC)
            expect(receivedSuccess).toEqual(true)
            expect(receivedData).not.toEqual(null)
        }
    })

    test('should return exist user if phone already exists', async () => {
        mockType = await Type.create({
            name: ROLES.PARTNER
        })

        mockPartner = await User.create({
            email: faker.internet.email(),
            password: bcrypt.hashSync(fakePassword, 10),
            companyName: faker.company.name(),
            phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
            typeId: mockType.id,
            tenantId: null
        })

        if (mockPartner && mockType) {
            mockRequest = {
                body: {
                    companyName: faker.company.name(),
                    email: faker.internet.email(),
                    password: bcrypt.hashSync(faker.internet.password(), 10),
                    phone: mockPartner.phone
                }
            }

            await register(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.PHONE_ALREADY_EXISTS, null)
        }
    })

    test('should return exist user if email already exists', async () => {
        mockType = await Type.create({
            name: ROLES.PARTNER
        })

        mockPartner = await User.create({
            email: faker.internet.email(),
            password: bcrypt.hashSync(fakePassword, 10),
            companyName: faker.company.name(),
            phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
            typeId: mockType.id,
            tenantId: null
        })

        if (mockPartner && mockType) {
            mockRequest = {
                body: {
                    companyName: faker.company.name(),
                    email: mockPartner.email,
                    password: bcrypt.hashSync(faker.internet.password(), 10),
                    phone: faker.number.int({ min: 10000000, max: 99999999 }).toString()
                }
            }

            await register(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.EMAIL_ALREADY_EXISTS, null)
        }
    })

    test('should return status 400 if request body is missing data', async () => {
        // Missing 'companyName' field in the request body
        mockRequest.body = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            phone: faker.number.int({ min: 10000000, max: 99999999 }).toString()
        }

        await register(mockRequest as Request, mockResponse as Response)

        expectResponse(mockResponse, 400, false, MSG.DATA_MISSING, null)
    })
})

describe('Login', () => {
    const fakePassword = faker.internet.password()
    beforeEach(async () => {
        mockType = await Type.create({
            name: ROLES.PARTNER
        })
        mockPartner = await User.create({
            email: faker.internet.email(),
            password: bcrypt.hashSync(fakePassword, 10),
            companyName: faker.company.name(),
            phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
            typeId: mockType.id,
            tenantId: null
        })
    })

    afterAll(async () => {
        if (mockPartner) {
            await removeUser(mockPartner.toJSON().id!)
        }
    })
    afterEach(async () => {
        if (mockPartner) {
            removeUser(mockPartner.id)
            mockPartner = null
        }
    })

    test('should return 400 if email or password is missing', async () => {
        mockRequest = {
            body: {
                login: 'test@example.com'
            }
        } // Missing password

        await login(mockRequest as Request, mockResponse as Response)

        expectResponse(mockResponse, 400, false, MSG.DATA_MISSING, null)
    })

    test('should return null if user not found - login', async () => {
        if (mockPartner) {
            mockRequest = {
                body: {
                    login: 'nonexistent@example.com',
                    password: mockPartner.password
                }
            }
            await login(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.NOT_FOUND, null)
        }
    })

    test('should return null if credentials are wrong - login', async () => {
        if (mockPartner) {
            mockRequest = {
                body: {
                    login: mockPartner.phone,
                    password: bcrypt.hashSync(faker.internet.password(), 10)
                }
            }
            await login(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.WRONG_CREDENTIALS, null)
        }
    })

    test('should return null if account not verified - login', async () => {
        if (mockPartner) {
            mockRequest = {
                body: {
                    login: mockPartner.phone,
                    password: fakePassword
                }
            }
            await login(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.ACCOUNT_NOT_VERIFIED, null)
        }
    })

    test('should return logged user - login', async () => {
        const mockedType = await Type.create({
            name: ROLES.PARTNER
        })
        const mockedPartner = await User.create({
            email: faker.internet.email(),
            password: bcrypt.hashSync(fakePassword, 10),
            companyName: faker.company.name(),
            phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
            typeId: mockedType.id,
            tenantId: null,
            isActive: true
        })
        if (mockedPartner) {
            mockRequest = {
                body: {
                    login: mockedPartner.phone,
                    password: fakePassword
                }
            }
            await login(mockRequest as Request, mockResponse as Response)

            const receivedMessage = (mockResponse!.send as jest.Mock).mock.calls[0][0].message
            const receivedSuccess = (mockResponse!.send as jest.Mock).mock.calls[0][0].success
            expect(mockResponse.status).toHaveBeenCalledWith(200)
            expect(receivedMessage).toEqual(MSG.LOGGED_IN)
            expect(receivedSuccess).toEqual(true)
        }
    })
})
