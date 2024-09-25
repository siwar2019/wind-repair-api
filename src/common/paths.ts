export enum Paths {
    // Auth
    AUTH = '/auth',
    LOGIN = '/login',
    REGISTER = '/register',
    FORGOT_PASSWORD = '/forgot-password',
    RESET_PASSWORD = '/reset-password',

    //Product
    CREATE_PRODUCT = '/create-product',
    PRODUCT = '/product',
    ASSIGN_PRODUCT = '/assign-product/:id',
    DELETE_PRODUCT = '/delete-product/:id',
    GET_ALL_PRODUCTS = '/all-products',
    UPDATE_PRODUCT = '/update-product/:id',
    GET_PRODUCT = '/get-product/:id',

    //Partner
    PARTNER = '/partner',
    CREATE_PARTNER = '/create-partner',
    GET_ALL_PARTNERS = '/all-partners',
    DELETE_PARTNER = '/delete-partner/:id',
    UPDATE_PARTNER = '/update-partner/:id',

    //Role
    ROLE = '/role',
    CREATE_ROLE = '/create-role',
    GET_ALL_ROLES = '/all-roles',
    DELETE_ROLE = '/delete-role/:id',
    UPDATE_ROLE = '/update-role/:id',

    //Menu
    MENU = '/menu',
    CREATE_MENU = '/create-menu',
    UPDATE_MENU = '/update-menu/:id',
    DELETE_MENU = '/delete-menu/:id',
    GET_ALL_MENUS = '/all-menus',
    ASSIGNED_MENU = '/assigned-menu',
    GET_ALL_MENUS_PARTNER = '/all-menus-partner',
    GET_ALL_MENUS_ROLE = '/all-menus-role/:id',
    GET_PERMESSIONS = '/permessions',

    //User
    USER = '/user',
    CREATE_EMPLOYEE = '/create-employee',
    DELETE_USER = '/delete-user/:id',
    GET_ALL_USERS = '/all-users',
    UPDATE_USER = '/update-user/:id',
    EDIT_PROFILE = '/edit-profile',
    CHANGE_PASSWORD = '/change-password',
    GET_USER = '/get-user/:id',
    GET_USER_DATA = '/get-user-data',

    //type
    TYPE = '/type',
    CREATE_TYPE = '/create-type',

    //ticket
    TICKET = '/ticket',
    UPDATE_TICKET = '/update-ticket/:id',
    DELETE_TICKET = '/delete-ticket/:id',
    GET_ALL_TICKETS = '/all-tickets',
    GET_ALL_PRODUCT_TICKETS = '/all-product-tickets/:id',
    GET_DEATILS_TICKET = '/details-ticket/:uuid',

    //Invoice
    INVOICE = '/invoice',
    GET_ALL_INVOICES = '/all-invoices',
    UPDATE_INVOICE = '/update-invoice/:id',
    DELETE_INVOICE = '/delete-invoice/:id',

    //cash register
    CASH_REGISTER = '/cash-register',
    CREATE_CASH_REGISTER = '/create',
    GET_ALL_CASH_REGISTERS = '/all',
    UPDATE_CASH_REGISTER = '/update/:id',
    DELETE_CASH_REGISTER = '/delete/:id',

    //movement
    MOVEMENT = '/movement',
    CREATE_MOVEMENT = '/create',
    GET_ALL_MOVEMENT = '/all/:id',

    //payment
    PAYMENT = '/payment',
    GET_ALL_PAYMENT = '/all',
    GENERATE_QR_IMAGE = '/generate-qr-image',
    AUTHENTICATE = '/authenticate',
    QR_CODE_GENERATE = '/qrcode/generate',
    GET_STATUS_QR_CODE = '/qrcode/state',
    GET_STATUS = '/status/:codePay',
    GET_PARTNER_PAYMENTS = '/partner-payments/:id',

    //Subscription
    SUBSCRIPTION = '/subscription',
    GET_ALL_SUBSCRIPTIONS = '/all',

    STATISTIC = '/statistic',
    GET_STATISTIC = '/all/:period',

    //settings
    SETTINGS = '/settings',
    CREATE_SETTINGS = '/create',
    UPDATE_SETTINGS = '/update/:id',
    GET_SETTING = '/get-setting/:id',
    GET_ALL_SETTINGS = '/all',
    GET_DETAILS_ERP_API_TEST = '/get-details-erp-test',
    GET_TOKEN_ERP = '/auth-erp',
    GET_ALL_CATEGORY_AND_PRODUCTS_ERP = '/getAllCategoryAndProducts/:token',
    CREATE_ERP_SETTING = '/create-erp-setting',
    GET_ALL_DELIVERY = '/getAllDelivery/:token',
    CONFIRM_DELIVERY = '/confirm-delivery',
    GET_SELLING_DATE = '/get-selling-date/:token/:code',
    PAY_DELIVERY = '/pay-delivery',
    CREATE_DELIVERY = '/create-delivery',
    ADD_EMAIL_ERP = '/add-email-erp',
    GET_ALL_CATEGORY_AND_PRODUCTS_BY_NAME_ERP = '/get-category-products-by-name/:token',

    //notification
    NOTIFICATIONS = '/notifications',
    GET_ALL_NOTIFICATIONS = '/all',
    UPDATE_NOTIFICATIONS = '/update',

    //Store
    STORE = '/store',
    CREATE_STORE = '/create-store',
    GET_ALL_STORES = '/all',
    GET_STORE_DETAILS = '/get-details/:id',

    //Swagger
    API_DOC = '/api-doc'
}
