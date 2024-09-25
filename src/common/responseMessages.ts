export const MSG = {
    // COMMON
    SERVER_ERROR: 'serverError',
    LOGGED_IN: 'loggedIn!',
    ERROR_OCCURRED: 'errorOccurred',
    UNAUTHORIZED: 'unauthorized',
    FORBIDDEN: 'forbidden',
    DATA_MISSING: 'dataMissing',
    NOT_FOUND: 'notFound',
    SQL_ERROR: 'sqlError',
    WRONG_CREDENTIALS: 'wrongPasswordOrEmail',
    WRONG_PASSWORD: 'wrongPassword',
    EMAIL_ALREADY_EXISTS: 'emailAlreadyExists',
    EMAIL_NOT_SENT: 'emailNotSent',
    EMAIL_SENT: 'emailSent',
    NO_TOKEN: 'noToken',
    NO_USER: 'noUser',
    JWT_EXPIRE: 'jwtTokenHasExpired',
    PASS_UPDATE_SUCC: 'passwordUpdatedSuccessfully',
    PASS_UPDATE_FAIL: 'failedToUpdatePassword',
    INVALID_TOKEN: 'invalidToken',
    ROLE_ADDED_SUCC: 'roleAddSuccess',
    SUB_MODULE_ADDED_SUCC: 'subModuleAddSuccess',
    TAB_ADDED_SUCC: 'tabAddSuccess',
    BUTTON_ADDED_SUCC: 'buttonAddSuccess',
    INVALID_ID: 'invalidId',
    PHONE_ALREADY_EXISTS: 'phoneAlreadyExists',
    INVALID_PERIOD: 'invalidPeriod',
    SETTING_NOT_FOUND: 'settingNotFound',

    //Product
    PRODUCT_CREATED: 'productCreated',
    PRODUCT_ASSIGNED: 'productAssigned',
    PRODUCT_UPDATED: 'productUpdated',
    PRODUCT_DELETED_SUCC: 'productDeletedSuccessfully',
    PRODUCTS_FETCHED_SUCC: 'productsFetchedSuccessfully',
    PRODUCT_FETCHED_SUCC: 'productFetchedSuccessfully',
    NO_FILTERED_PRODUCTS_LIST: 'noFiltteredProductsList',
    NO_PRODUCTS_LIST: 'noProductsList',
    FILTERED_PRODUCTS_FETCHED_SUCC: 'filtteredProductsFetchedSuccessfully',

    //Auth
    WRONG_OLD_PASSWORD: 'oldPasswordIsWrong',
    SAME_OLD_PASSWORD: 'newPasswordShouldBeDiffFromOldOne',
    PASSWORD_CHANGED_SUCCESSFULLY: 'yourPasswordHasBeenChangedSuccessfully',
    ACCOUNT_NOT_VERIFIED: 'accountNotVerified',

    //Partner
    PARTNER_ADDED_SUCC: 'partnerAddedSuccessfully',
    PARTNERS_FETCHED_SUCC: 'partnersFetchedSuccessfully',
    PARTNER_DELETED_SUCC: 'partnerDeletedSuccessfully',
    PARTNER_UPDATED_SUCC: 'partnerUpdatedSuccessfully',
    NO_FILTERED_PARTNERS_LIST: 'noFiltteredPartnersList',
    NO_PARTNERS_LIST: 'noPartnersList',
    FILTERED_PARTNERS_FETCHED_SUCC: 'filtteredPartnersFetchedSuccessfully',

    //User
    USER_ADDED_SUCC: 'userAddedSuccessfully',
    USER_DELETED_SUCC: 'userDeletedSuccessfully',
    USERS_FETCHED_SUCC: 'usersFetchedSuccessfully',
    NO_FILTERED_USERS_LIST: 'noFiltteredUsersList',
    NO_USERS_LIST: 'noUsersList',
    FILTERED_USERS_FETCHED_SUCC: 'filtteredUsersFetchedSuccessfully',
    USER_UPDATED_SUCC: 'userUpdatedSuccessfully',
    PROFILE_EDITED_SUCC: 'profileEditedSuccessfully',
    PASSWORD_CHANGED_SUCC: 'passwordchnagedSuccessfully',
    USER_FETCHED_SUCC: 'userFetchedSuccessfully',
    USER_ALREADY_EXIST: 'userAlreadyExist',

    //Menu
    MENU_UPDATED_SUCC: 'menuUpdatedSuccessfully',
    MENU_ADDED_SUCC: 'menuAddSuccess',
    MENUS_FETCHED_SUCC: 'menusFetchedSuccessfully',
    MENU_DELETED_SUCC: 'menuDeletedSuccessfully',
    MENU_ASSIGNED_TO_ROLE_SUCC: 'menuAssignedToRoleSuccessfully',
    MENU_NOT_FOUND: 'menuNotFound',
    BUTTON_ALREADY_EXISTS: 'buttonAlreadyExists',
    MENU_ALREADY_EXISTS: 'menuAlreadyExists',

    //Role
    ROLE_NOT_FOUND: 'roleNotFound',
    ROLES_FETCHED_SUCC: 'rolesFetchedSuccessfully',
    ROLE_DELETED_SUCC: 'roleDeletedSuccessfully',
    ROLE_UPDATED_SUCC: 'roleUpdatedSuccessfully',

    //Type
    TYPE_ADDED_SUCC: 'typeAddedSuccessfully',

    //Ticket
    TICKET_UPDATED: 'ticketUpdated',
    TICKET_DELETED_SUCC: 'ticketDeletedSuccessfully',
    TICKETS_FETCHED_SUCC: 'ticketsFetchedSuccessfully',
    NO_FILTERED_TICKETS_LIST: 'noFiltteredTicketsList',
    NO_TICKETS_LIST: 'noTicketsList',
    FILTERED_TICKETS_FETCHED_SUCC: 'filtteredTicketsFetchedSuccessfully',
    TICKET_FETCHED_SUCC: 'ticketFetchedSuccessfully',

    //Invoice
    INVOICE_ADDED_SUCC: 'invoiceAddedSuccessfully',
    INVOICE_UPDATED: 'invoiceUpdatedSuccessfully',
    INVOICE_DELETED_SUCC: 'invoiceDeletedSuccessfully',
    INVOICES_FETCHED_SUCC: 'invoicesFetchedSuccessfully',
    NO_FILTERED_INVOICES_LIST: 'noFiltteredInvoicesList',
    NO_INVOICES_LIST: 'noInvoicesList',
    FILTERED_INVOICES_FETCHED_SUCC: 'filtteredInvoicesFetchedSuccessfully',

    //CashRegister
    CASH_RESGISTER_ADDED_SUCC: 'cashRegisterAddedSuccessfully',
    CASH_RESGISTER_UPDATED: 'cashRegisterUpdatedSuccessfully',
    CASH_RESGISTER_DELETED_SUCC: 'cashRegisterDeletedSuccessfully',
    CASH_RESGISTER_FETCHED_SUCC: 'cashRegistersFetchedSuccessfully',
    NO_FILTERED_CASH_RESGISTER_LIST: 'noFiltteredcashRegistersList',
    NO_CASH_RESGISTER_LIST: 'nocashRegistersList',
    FILTERED_CASH_RESGISTER_FETCHED_SUCC: 'filtteredcashRegistersFetchedSuccessfully',
    UNABLE_TO_DELETE_MAIN_CASH_REGISTER: 'unableToDeleteMainCashRegister',
    CASH_RESGISTER_NAME_EXIST: 'cashRegisterNameExist',

    //Movement
    MOVEMENT_ADDED_SUCC: 'movementAddedSuccessfully',
    MOVEMENT_UPDATED: 'movementUpdatedSuccessfully',
    MOVEMENT_DELETED_SUCC: 'movementDeletedSuccessfully',
    MOVEMENTS_FETCHED_SUCC: 'movementsFetchedSuccessfully',
    NO_FILTERED_MOVEMENT_LIST: 'noFiltteredmovementsList',
    NO_MOVEMENT_LIST: 'nomovementsList',
    FILTERED_MOVEMENT_FETCHED_SUCC: 'filtteredmovementsFetchedSuccessfully',

    //payment
    PAYMENT_FETCHED_SUCC: 'paymentsFetchedSuccessfully',
    TOKEN_ERROR: 'missingOrInvalidToken',
    QR_CODE_ERROR: 'missingQrCode',
    QR_CODE_SUCCESS: 'generateQrCodeSuccessfully',
    STATUS_FETCHED_SUCC: 'statusFetchedSuccessfully',
    INVALID_CODE_PAY: 'invalidCodePay',
    SUBSCRIPTION_NOT_PAID: 'subscriptionNotPaid',
    SUBSCRIPTION_EXPIRED: 'subscriptionExpired',

    //subscription
    SUBSCRIPTION_SUCCESS: 'subscriptionSuccess',

    //settings
    SETTINGS_ADDED_SUCC: 'settingsAddedSuccessfully',
    SETTINGS_UPDATED_SUCC: 'settingsUpdatedSuccessfully',
    SETTING_FETCHED_SUCC: 'settingFetchedSuccessfully',
    TOKEN_FETCHED_SUCC: 'tokenFetchedSuccessfully',
    CUSTOMER_ERP_ADD_SUCC: 'customerErpAddedSuccessfully',
    CAISSE_ERP_ADD_SUCC: 'caisseErpAddedSuccessfully',
    DELIVERY_FETCHED_SUCC: 'deliveryFetchedSuccessfully',
    DELIVERY_CONFIRMED_SUCC: 'deliveryConfirmedSuccessfully',
    SELLING_DATE_FETCHED_SUCC: 'sellingDateFetchedSuccessfully',
    DELIVERY_PAYED_SUCC: 'deliveryPayedSuccessfully',
    CATEGORY_AND_PRODUTS_FETCHED_SUCC: 'categoryAndProductsFetchedSuccessfully',
    DELIVERY_CREATED_SUCC: 'deliveryCreatedSuccessfully',
    EMAIL_ERP_ADDED_SUCC: 'emailErpAddesSuccessfully',
    CATEGORY_PRODUCTS_NOT_EXISTS: 'categoryProductsNotExist',
    EMAIL_ERP_NOT_EXIST: 'emailErpNotExist',

    //notifications
    NOTIFICATIONS_FETCHED_SUCC: 'notificationFetchedSuccessfully',
    NOTIFICATIONS_UPDATED_SUCC: 'notificationssUpdatedSuccessfully',
    //employee
    EMPLOYEE_NOT_FOUND: 'Employee not found',

    //store
    STORE_ADDED_SUCC: 'storeAddSuccess',
    STORES_FETCHED_SUCC: 'storesFetchedSuccessfully',
    STORE_NOT_FOUND: 'storeNotFound',
    STORE_ALREADY_EXISTS: 'storeAlreadyExists'
}
