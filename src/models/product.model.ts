import {
    Table,
    Model,
    Column,
    DataType,
    AutoIncrement,
    PrimaryKey,
    NotEmpty,
    AllowNull,
    ForeignKey,
    BelongsTo,
    HasOne,
    HasMany
} from 'sequelize-typescript'
import { PRODUCT_STATUS } from '../utils/constant'
import { RepairTicket } from './repairTicket.model'
import { User } from './user.model'
import { Part } from './part.model'
import { HistoryProduct } from './historyProduct'
import { Movement } from './movement.model'
import { SubStore } from './subStore.model'

@Table({
    timestamps: true,
    tableName: 'products'
})
export class Product extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    id!: number

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'serial_number'
    })
    serialNumber!: string

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name!: string

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    model!: string

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'problem_description'
    })
    problemDescription!: string

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: PRODUCT_STATUS.PENDING,
        values: [PRODUCT_STATUS.PENDING, PRODUCT_STATUS.IN_PROGRESS, PRODUCT_STATUS.CLOSED_FAIL, PRODUCT_STATUS.CLOSED_SUCCESS]
    })
    status!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'closed_description_reason'
    })
    closedDescriptionReason!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    guarantee!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'sale_Date'
    })
    saleDate!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    pin!: string

    @AllowNull(true)
    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'date_fin_warranty'
    })
    dateFinWarranty!: Date

    // ------------------------  HasOne Relations ---------------------------
    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'client_id'
    })
    clientId!: number

    @BelongsTo(() => User, { as: 'client' })
    client!: User

    @ForeignKey(() => User)
    @AllowNull(true)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'employee_id'
    })
    employeeId!: number | null

    @BelongsTo(() => User)
    employee!: User

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'partner_id'
    })
    partnerId!: number

    @BelongsTo(() => User)
    partner!: User

    @ForeignKey(() => SubStore)
    @AllowNull(true)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'sub_store_id'
    })
    subStoreId!: number

    @BelongsTo(() => SubStore)
    subStore!: SubStore

    // ------------------------ HasMany Relations ---------------------------

    @HasOne(() => RepairTicket, {
        as: 'repairticket',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    repairticket!: RepairTicket

    @HasMany(() => Part, {
        as: 'parts',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    parts!: Part[]

    @HasMany(() => HistoryProduct, {
        as: 'history',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    history!: HistoryProduct[]

    @HasMany(() => Movement, {
        as: 'movement',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    movements!: Movement[]
}
