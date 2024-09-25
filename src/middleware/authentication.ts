import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
// common
import { errorServerResponse, sendApiResponse } from '../common/functions'
// interfaces
import { MSG } from '../common/responseMessages'
import { TDecodedUser } from '../interfaces/user'
import { jwtDecode } from 'jwt-decode'

declare global {
    namespace Express {
        interface Request {
            user?: {
                role: string
                id: number
                tenantId?: number
                typeId?: number
                iat: number
                exp: number
            }
        }
    }
}

/**
 * @description check if user is logged in
 * @param req
 * @param res
 * @param next
 * @returns
 */
const isAuthenticated = (roles: string[]) => {
    const privateKey = process.env.JWT as string
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization
            if (!authHeader || authHeader === 'undefined') {
                return sendApiResponse(res, 400, MSG.NO_TOKEN, null)
            }

            const token = authHeader.split(' ')[1]
            if (!token || authHeader.split(' ')[0].toLowerCase() !== 'bearer') {
                return sendApiResponse(res, 400, MSG.UNAUTHORIZED, null)
            }
            const decoded: TDecodedUser | null = jwtDecode(token)
            if (!decoded || !decoded.role) {
                return sendApiResponse(res, 400, MSG.INVALID_TOKEN, null)
            }

            const userRole = decoded.role.toLowerCase()
            if (roles.length > 0 && !roles.includes(userRole)) {
                return sendApiResponse(res, 403, MSG.UNAUTHORIZED, null)
            }

            jwt.verify(token, privateKey, function (err) {
                if (err) {
                    return sendApiResponse(res, 402, MSG.FORBIDDEN, null)
                }
                const decodedToken: TDecodedUser = jwtDecode(token)
                req.user = decodedToken
                next()
            })
        } catch (error) {
            console.log('error', error)
            return errorServerResponse(res)
        }
    }
}

const verifyTokenReset = (req: Request, res: Response, next: NextFunction) => {
    const resetToken = req.body.resetToken
    if (!resetToken) return sendApiResponse(res, 400, MSG.NO_TOKEN, null)
    try {
        const decoded = jwt.verify(resetToken, process.env.JWT as string) as TDecodedUser
        if (decoded.exp && Date.now() >= decoded.exp * 1000) return sendApiResponse(res, 403, MSG.JWT_EXPIRE, null)
        req.user = decoded
        next()
    } catch (error) {
        if (error instanceof JsonWebTokenError) return sendApiResponse(res, 400, MSG.INVALID_TOKEN, null)

        return errorServerResponse(res)
    }
}

export { isAuthenticated, verifyTokenReset }
