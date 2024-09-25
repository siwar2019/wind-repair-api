import {
    Table,
    Column,
    DataType,
    AutoIncrement,
    PrimaryKey,
    ForeignKey,
    BelongsTo,
    AllowNull,
    NotEmpty,
    Model
} from 'sequelize-typescript'
import { CashRegister } from './cashRegister.model'
import { Product } from './product.model'

@Table({
    timestamps: true,
    tableName: 'movement'
})
export class Movement extends Model {
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
        type: DataType.FLOAT,
        allowNull: false,
        defaultValue: 0
    })
    value!: number

    @ForeignKey(() => CashRegister)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'cash_register_id'
    })
    cashRegisterId!: number

    @BelongsTo(() => CashRegister, { as: 'cashRegister', foreignKey: 'cashRegisterId' })
    cashRegister!: CashRegister

    @ForeignKey(() => CashRegister)
    @AllowNull(true)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'main_cash_register_id'
    })
    mainCashRegisterId!: number

    @BelongsTo(() => CashRegister, { as: 'mainCashRegister', foreignKey: 'mainCashRegisterId' })
    mainCashRegister!: CashRegister

    @ForeignKey(() => Product)
    @AllowNull(true)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'product_id'
    })
    productId!: number

    @BelongsTo(() => Product)
    product!: Product
}
