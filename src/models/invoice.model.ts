import {
    Table,
    Column,
    DataType,
    AutoIncrement,
    PrimaryKey,
    ForeignKey,
    BelongsTo,
    AllowNull,
    Model,
    NotEmpty
} from 'sequelize-typescript'
import { RepairTicket } from './repairTicket.model'
import { PAYMENT_METHOD } from '../utils/constant'

@Table({
    timestamps: true,
    tableName: 'invoices'
})
export class Invoice extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    id!: number

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    num!: string

    @AllowNull(true)
    @NotEmpty
    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    date!: Date

    @AllowNull(true)
    @NotEmpty
    @Column({
        type: DataType.FLOAT,
        allowNull: true
    })
    tax!: number

    @AllowNull(true)
    @NotEmpty
    @Column({
        type: DataType.FLOAT,
        allowNull: true
    })
    discount!: number

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.FLOAT,
        allowNull: false
    })
    total!: number

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    status!: boolean

    @AllowNull(true)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    notes!: string

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'payment_method',
        defaultValue: PAYMENT_METHOD.CASH
    })
    paymentMethode!: string

    @ForeignKey(() => RepairTicket)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'ticket_id'
    })
    ticketId!: number

    @BelongsTo(() => RepairTicket)
    repairTicket!: RepairTicket
}
