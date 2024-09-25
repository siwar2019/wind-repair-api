import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, AllowNull, HasOne } from 'sequelize-typescript'
import { SubscriptionPayment } from './subscriptionPayment.model'

@Table({
    timestamps: true,
    tableName: 'subscription'
})
export class Subscription extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    id!: number

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'nbr_max_employee',
        defaultValue: 1
    })
    nbrMaxEmployee!: number

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    price!: number

    @HasOne(() => SubscriptionPayment, {
        as: 'subscriptionPayment',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    subscriptionPayment!: SubscriptionPayment
}
