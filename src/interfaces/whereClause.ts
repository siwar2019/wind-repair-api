export interface WhereClause {
    partnerId?: number
    clientId?: number
    employeeId?: number | null
}

export interface DynamicWhereClause extends WhereClause {
    [key: string]: any
}
