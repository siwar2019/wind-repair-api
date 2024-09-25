export interface AxiosConfig {
    method: string
    url: string
    headers: {
        Authorization: string
        'Content-Type': string
    }
    data?: any
}
