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
    BelongsTo
} from 'sequelize-typescript'
import { Product } from './product.model'
import { PRODUCT_STATUS } from '../utils/constant'

@Table({
    timestamps: true,
    tableName: 'historyproduct'
})
export class HistoryProduct extends Model {
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
        allowNull: false,
        values: [PRODUCT_STATUS.PENDING, PRODUCT_STATUS.IN_PROGRESS, PRODUCT_STATUS.CLOSED_SUCCESS, PRODUCT_STATUS.CLOSED_FAIL]
    })
    status!: string

    @ForeignKey(() => Product)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'product_id'
    })
    productId!: number

    @BelongsTo(() => Product)
    product!: Product
}
