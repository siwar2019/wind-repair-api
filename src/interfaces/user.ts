export type TDecodedUser = {
    role: string
    id: number
    iat: number
    exp: number
    tenantId?: number
    typeId?: number
}

export interface UpdatedUserData {
    name?: string
    email?: string
    phone?: string
    companyName?: string
    image?: Buffer | string
}
