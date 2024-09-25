import {
    Table,
    Model,
    Column,
    DataType,
    AutoIncrement,
    PrimaryKey,
    AllowNull,
    ForeignKey,
    HasMany,
    BelongsToMany,
    BelongsTo,
    HasOne
} from 'sequelize-typescript'
import { Product } from './product.model'
import { Type } from './type.model'
import { Role } from './role.model'
import { CashRegister } from './cashRegister.model'
import { UserRole } from './userRole.model'
import { SubscriptionPayment } from './subscriptionPayment.model'
import { Settings } from './settings.model'
import { Notification } from './notification.model'
import { Store } from './store.model'
import { ErpSettings } from './erpSetting.model'

@Table({
    timestamps: true,
    tableName: 'users'
})
export class User extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    id!: number

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    email!: string

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    password!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'company_name'
    })
    companyName!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    name!: string

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: 'column'
    })
    phone!: string

    @Column({
        type: DataType.BOOLEAN,
        field: 'is_active',
        defaultValue: false
    })
    isActive!: boolean

    @Column({
        type: DataType.BOOLEAN,
        field: 'is_deleted',
        defaultValue: false
    })
    isDeleted!: boolean

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        field: 'reset_token',
        allowNull: true
    })
    resetToken!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    image!: string

    @Column({
        type: DataType.BOOLEAN,
        field: 'is_erp_client',
        defaultValue: false
    })
    isErpClient!: boolean

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'email_erp_client'
    })
    emailErpClient!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'name_category'
    })
    nameCategory!: string

    // ------------------------ HasMany Relations ---------------------------
    @HasMany(() => Product, {
        as: 'products',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    products!: Product[]

    @ForeignKey(() => Type)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'type_id'
    })
    typeId!: number

    @BelongsTo(() => Type)
    type!: Type

    @ForeignKey(() => User)
    @AllowNull(true)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'tenant_id'
    })
    tenantId!: number
    @BelongsTo(() => User)
    company!: User

    @HasMany(() => Role, {
        as: 'roles',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    roles!: Role[]

    @BelongsToMany(() => Role, () => UserRole)
    role!: Role[]

    @HasMany(() => CashRegister, {
        as: 'cashregister',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    cashRegister!: CashRegister[]

    @HasOne(() => SubscriptionPayment, {
        as: 'subscriptionPayment',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    subscriptionPayment!: SubscriptionPayment

    @HasMany(() => Settings, {
        as: 'settings',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    Settings!: Settings[]

    @HasMany(() => Notification, {
        as: 'notifications',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    notifications!: Notification[]

    @HasMany(() => Store, {
        as: 'stores',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    stores!: Store[]

    @HasOne(() => ErpSettings, {
        as: 'erpSetting',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    erpSetting!: ErpSettings
}
