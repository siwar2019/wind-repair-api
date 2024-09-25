// models

import { Product } from '../../models/product.model'

const getProductByID = (id: number) => {
    return Product.findOne({
        where: {
            id
        }
    })
}

const createProduct = async (
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
        user = await Product.create({
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

const removeProduct = async (id: number) => {
    await Product.destroy({
        where: { id }
    })
}

export { createProduct, removeProduct, getProductByID }
