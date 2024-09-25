import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { TYPE_PAYMENT } from '../utils/constant'
import { User } from './user.model'
import { Subscription } from './subscription.model'

@Table({
    timestamps: true,
    tableName: 'subscriptionpayment'
})
export class SubscriptionPayment extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    id!: number

    @AllowNull(false)
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    payed!: boolean

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: TYPE_PAYMENT.free,
        values: [TYPE_PAYMENT.free, TYPE_PAYMENT.standard]
    })
    type!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    codePay!: string

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 2
    })
    nbrEmployee!: number

    @AllowNull(false)
    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'start_date'
    })
    startDate!: Date

    @AllowNull(false)
    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'end_date'
    })
    endDate!: Date

    // ------------------------ Foreign Keys ---------------------------

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'user_id'
    })
    userId!: number

    @BelongsTo(() => User)
    user!: User

    @ForeignKey(() => Subscription)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'subscription_id'
    })
    subscriptionId!: number

    @BelongsTo(() => Subscription)
    subscription!: Subscription
}
