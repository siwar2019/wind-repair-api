// models

import { User } from '../../models/user.model'

const getUserByID = (id: number) => {
    return User.findOne({
        where: {
            id
        }
    })
}

const getUserByPhone = (phone: string) => {
    return User.findOne({
        where: {
            phone
        }
    })
}

const getUserByEmail = (email: string) => {
    return User.findOne({
        where: {
            email
        }
    })
}

const createPartner = async (
    email: string,
    password: string,
    phone: string,
    companyName: string,
    isActive: boolean,
    isDeleted: boolean,
    typeId: number,
    tenantId: number | null
) => {
    let user
    try {
        user = await User.create({
            email,
            password,
            phone,
            companyName,
            isActive,
            isDeleted,
            typeId,
            tenantId
        })
    } catch (error) {
        console.log(error, 'error')
    }

    return user
}

const createUser = async (email: string, password: string, phone: string, name: string, typeId: number, tenanatId: number) => {
    const user = await User.create({
        email,
        password,
        phone,
        name,
        typeId,
        tenanatId
    })
    return user
}

const removeUser = async (id: number) => {
    await User.destroy({
        where: { id }
    })
}

export { createPartner, removeUser, getUserByID, getUserByPhone, getUserByEmail, createUser }
