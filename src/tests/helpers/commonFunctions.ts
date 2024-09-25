import { Response } from 'express'

export const expectResponse = (mockResponse: Partial<Response>, status: number, success: boolean, message: string, data: any) => {
    expect(mockResponse.status).toHaveBeenCalledWith(status)
    expect(mockResponse.send).toHaveBeenCalledWith({
        success: success,
        message: message,
        data: data
    })
}
