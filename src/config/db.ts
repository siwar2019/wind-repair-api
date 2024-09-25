import dotenv from 'dotenv'
import { Sequelize } from 'sequelize-typescript'
import path from 'path'
import { User } from '../models/user.model'
import { Product } from '../models/product.model'
import { RepairTicket } from '../models/repairTicket.model'
import { Admin } from '../models/admin.model'
import { Role } from '../models/role.model'
import { MenusRole } from '../models/menusRole.model'
import { Tab } from '../models/tab.model'
import { Button } from '../models/button.model'
import { Menu } from '../models/menu.model'
import { CashRegister } from '../models/cashRegister.model'
import { Invoice } from '../models/invoice.model'
import { Type } from '../models/type.model'
import { Movement } from '../models/movement.model'
import { Part } from '../models/part.model'
import { HistoryProduct } from '../models/historyProduct'
import { UserRole } from '../models/userRole.model'
import { SubscriptionPayment } from '../models/subscriptionPayment.model'
import { Subscription } from '../models/subscription.model'
import { Settings } from '../models/settings.model'
import { Notification } from '../models/notification.model'
import { ParamsSettings } from '../models/paramsSettings.model'
import { Store } from '../models/store.model'
import { SubStore } from '../models/subStore.model'
import { ErpSettings } from '../models/erpSetting.model'

dotenv.config()

export const dbName = process.env.DB_NAME as string
const dbUsername = process.env.DB_USERNAME as string
const dbPassword = process.env.DB_PASSWORD as string
const host = process.env.HOST as string

interface SequelizeConfig {
    dialect: 'mysql' | 'sqlite'
    database?: string
    username?: string
    password?: string
    host?: string
    port?: number
    storage?: string
    pool?: {
        max: number
        min: number
        idle: number
        acquire: number
    }
    models?: any[]
    logging?: boolean
}

const isTestEnv = process.env.NODE_ENV === 'test'

const defaultConfig: SequelizeConfig = {
    dialect: isTestEnv ? 'sqlite' : 'mysql',
    database: isTestEnv ? undefined : dbName,
    username: isTestEnv ? undefined : dbUsername,
    password: isTestEnv ? undefined : dbPassword,
    host: isTestEnv ? undefined : host,
    port: isTestEnv ? undefined : 3306,
    storage: isTestEnv ? path.join(__dirname, './testdb.sqlite') : undefined,
    pool: isTestEnv
        ? undefined
        : {
              max: 1000000,
              min: 0,
              idle: 20000,
              acquire: 100000
          },
    models: [
        User,
        Product,
        RepairTicket,
        Admin,
        Menu,
        Role,
        MenusRole,
        Tab,
        Button,
        CashRegister,
        Invoice,
        Type,
        Movement,
        Part,
        HistoryProduct,
        UserRole,
        SubscriptionPayment,
        Subscription,
        Settings,
        Notification,
        ParamsSettings,
        Store,
        SubStore,
        ErpSettings
    ],
    logging: false
}

export const sequelize = new Sequelize(defaultConfig)
