export enum ROLES {
    ADMIN = 'admin',
    PARTNER = 'partner',
    EMPLOYEE = 'employee',
    CLIENT = 'client'
}

export enum ROLES_USER {
    EMPLOYEE = 'employee',
    CLIENT = 'client'
}

export enum PAYMENT_METHOD {
    CASH = 'cash',
    CHEQUE = 'cheque'
}

export enum PRODUCT_STATUS {
    PENDING = 'pending',
    CLOSED_SUCCESS = 'closedSuccess',
    CLOSED_FAIL = 'closedFail',
    IN_PROGRESS = 'inProgress'
}

export enum MENU_TYPE {
    MENU = 'menu',
    SUB_MENU = 'submenu',
    TAB = 'tab',
    BUTTON = 'button'
}

export enum SubjectEmail {
    ADD = 'add',
    ACTIVE = 'active',
    forgotPassword = 'forgotPassword'
}

export enum MOVEMENT_TYPE {
    CREDIT = 'credit',
    DEBIT = 'debit'
}

export enum TYPE_PAYMENT {
    free = 'free',
    standard = 'standard'
}

export enum STATUS_PAYMENT {
    PAID = 'PAID',
    UNPAID = 'UNPAID',
    EXPIRED = 'EXPIRED'
}

export enum NotificationType {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    SUCCESS = 'success'
}

export enum NotificationPriority {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low'
}

export enum EndPointType {
    GET = 'get',
    POST = 'post',
    PATCH = 'patch',
    DELETE = 'delete'
}

export enum TypeParamsSetting {
    STRING = 'string',
    INTEGER = 'integer',
    BOOLEAN = 'boolean'
}

export enum TYPE_DELIVERY {
    ACHAT = 'ACHAT',
    VENTE = 'VENTE'
}

export const EMAIL_FROM_NAME = 'Wind Repair Support'
export const VERIFY_ACCOUNT_SUBJECT = 'Verify your account'
export const ACCOUNT_VERIFID_SUBJECT = 'Your account has been set as active'
export const PASSWORD_RESET = 'Password Reset'
export const fakeId = 1000
export const country = 'Tunisie'
export const currency = 'TND'
