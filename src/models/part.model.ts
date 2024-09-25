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

@Table({
    timestamps: true,
    tableName: 'parts'
})
export class Part extends Model {
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
    name!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    category!: string

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    price!: number

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    garantie!: number

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    uuidProduct!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    uuidVariant!: string

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
