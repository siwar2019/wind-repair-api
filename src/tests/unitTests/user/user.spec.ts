import { Request, Response } from 'express'
import fs from 'fs'
// config
import { sequelize } from '../../../config/db'
import { User } from '../../../models/user.model'
import { removeUser } from '../../helpers/user'
import { createEmployee, deleteUser, getAllUsers, updateUser } from '../../../controllers/user.controller'
import { faker } from '@faker-js/faker'
import { expectResponse } from '../../helpers/commonFunctions'
import { MSG } from '../../../common/responseMessages'
import bcrypt from 'bcrypt'
import { Type } from '../../../models/type.model'
import { Role } from '../../../models/role.model'
import { ROLES_USER } from '../../../utils/constant'

let mockRequest: Partial<Request>
let mockResponse: Partial<Response>
let mockUser: User | null
let mockRole: Role | null
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

beforeEach(async () => {
    try {
        mockType = await Type.create({
            name: ROLES_USER.EMPLOYEE
        })

        mockPartner = await User.create({
            email: faker.internet.email(),
            password: bcrypt.hashSync(faker.internet.password(), 10),
            companyName: faker.company.name(),
            phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
            isActive: true,
            isDeleted: false,
            typeId: mockType.id,
            tenantId: null
        })

        mockRole = await Role.create({
            name: 'receptionist',
            createdBy: mockPartner.id
        })
    } catch (error) {
        console.log(error, error)
    }
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

describe('create employee', () => {
    afterEach(async () => {
        if (mockUser) {
            await removeUser(mockUser.id)
        }
        jest.clearAllMocks()
    })
    test('should return 200 if employee created with success', async () => {
        if (mockPartner && mockRole) {
            const employee = {
                name: faker.person.firstName(),
                email: faker.internet.email(),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                roleId: mockRole.id
            }

            mockRequest = {
                body: {
                    name: employee.name,
                    email: employee.email,
                    phone: employee.phone,
                    roleId: employee.roleId,
                    user: {
                        id: mockPartner.toJSON().id
                    }
                }
            }

            await createEmployee(mockRequest as Request, mockResponse as Response)

            const receivedMessage = (mockResponse!.send as jest.Mock).mock.calls[0][0].message
            const receivedSuccess = (mockResponse!.send as jest.Mock).mock.calls[0][0].success
            const receivedData = (mockResponse!.send as jest.Mock).mock.calls[0][0].success

            //tests
            expect(mockResponse.status).toHaveBeenCalledWith(200)
            expect(receivedMessage).toEqual(MSG.USER_ADDED_SUCC)
            expect(receivedSuccess).toEqual(true)
            expect(receivedData).not.toEqual(null)
        }
    })
    test('should return exist user if email already exists', async () => {
        if (mockPartner && mockRole) {
            const employee = {
                name: faker.person.firstName(),
                email: mockPartner.email,
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                roleId: mockRole.id
            }

            mockRequest = {
                body: {
                    name: employee.name,
                    email: employee.email,
                    phone: employee.phone,
                    roleId: employee.roleId,
                    user: {
                        id: mockPartner.toJSON().id
                    }
                }
            }

            await createEmployee(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.EMAIL_ALREADY_EXISTS, null)
        }
    })

    test('should return exist user if phone already exists', async () => {
        if (mockPartner && mockRole) {
            const employee = {
                name: faker.person.firstName(),
                email: faker.internet.email(),
                phone: mockPartner.phone,
                roleId: mockRole.id
            }
            mockRequest = {
                body: {
                    name: employee.name,
                    email: employee.email,
                    phone: employee.phone,
                    roleId: employee.roleId,
                    user: {
                        id: mockPartner.toJSON().id
                    }
                }
            }

            await createEmployee(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.PHONE_ALREADY_EXISTS, null)
        }
    })
    test('should return status 400 if request body is missing data', async () => {
        // Missing 'companyName' field in the request body
        if (mockUser) {
            mockRequest.body = {
                email: faker.internet.email(),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString()
            }

            await createEmployee(mockRequest as Request, mockResponse as Response)

            expectResponse(mockResponse, 400, false, MSG.DATA_MISSING, null)
        }
    })
})

describe('getAllusers', () => {
    afterEach(async () => {
        jest.clearAllMocks()
    })

    test('should return employes data successfully', async () => {
        if (mockPartner) {
            mockRequest = {
                query: { page: '1', itemsPerPage: '10', typeUser: ROLES_USER.EMPLOYEE },
                body: {
                    user: {
                        id: mockPartner.toJSON().id
                    }
                }
            }

            const expectedStatusCode = 200

            await getAllUsers(mockRequest as Request, mockResponse as Response)

            expect(mockResponse.status).toHaveBeenCalledWith(expectedStatusCode)
        }
    })
})

describe('remove User', () => {
    test('should return 200 if user deleted with success', async () => {
        if (mockPartner && mockType) {
            mockUser = await User.create({
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                name: faker.person.firstName(),
                typeId: mockType.id,
                tenantId: mockPartner.id
            })
            mockRequest = {
                params: { id: mockUser.toJSON().id },
                body: {
                    user: {
                        id: mockPartner.toJSON().id
                    }
                }
            }

            await deleteUser(mockRequest as Request, mockResponse as Response)

            expectResponse(mockResponse, 200, true, MSG.USER_DELETED_SUCC, null)
        }
    })

    test('should return 400 if data missed', async () => {
        if (mockPartner && mockType) {
            mockUser = await User.create({
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                name: faker.person.firstName(),
                typeId: mockType.id,
                tenantId: mockPartner.id
            })
            mockRequest = {
                params: { id: '' },
                body: {
                    user: {
                        id: mockPartner.toJSON().id
                    }
                }
            }

            await deleteUser(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.INVALID_ID, null)
        }
    })

    test('should return 404 if user not found', async () => {
        if (mockPartner && mockType) {
            mockUser = await User.create({
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                name: faker.person.firstName(),
                typeId: mockType.id,
                tenantId: mockPartner.id
            })
            mockRequest = {
                params: { id: '1111' },
                body: {
                    user: {
                        id: mockPartner.toJSON().id
                    }
                }
            }

            await deleteUser(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 404, false, MSG.NOT_FOUND, null)
        }
    })
})

describe('update User', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })
    test('should update the user', async () => {
        if (mockPartner && mockType) {
            mockUser = await User.create({
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                name: faker.person.firstName(),
                typeId: mockType.id,
                tenantId: mockPartner.id
            })
            mockRequest = {
                params: { id: mockUser.toJSON().id },
                body: {
                    user: {
                        id: mockPartner.toJSON().id
                    }
                }
            }

            await updateUser(mockRequest as Request, mockResponse as Response)

            const updatedUser = await User.findOne({
                order: [['updatedAt', 'DESC']],
                where: { id: mockUser.toJSON().id }
            })

            expectResponse(mockResponse, 200, true, MSG.USER_UPDATED_SUCC, updatedUser)
        }
    })

    test('should return 404 if user not found', async () => {
        if (mockPartner && mockType) {
            mockUser = await User.create({
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                name: faker.person.firstName(),
                typeId: mockType.id,
                tenantId: mockPartner.id
            })
            mockRequest = {
                params: { id: '1111' },
                body: {
                    user: {
                        id: mockPartner.toJSON().id
                    }
                }
            }

            await updateUser(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 404, false, MSG.NOT_FOUND, null)
        }
    })

    test('should return 400 if data missed', async () => {
        if (mockPartner && mockType) {
            mockUser = await User.create({
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                phone: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                name: faker.person.firstName(),
                typeId: mockType.id,
                tenantId: mockPartner.id
            })
            mockRequest = {
                params: { id: '' },
                body: {
                    user: {
                        id: mockPartner.toJSON().id
                    }
                }
            }

            await updateUser(mockRequest as Request, mockResponse as Response)
            expectResponse(mockResponse, 400, false, MSG.INVALID_ID, null)
        }
    })
})
