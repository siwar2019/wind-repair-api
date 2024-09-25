import {
    Table,
    Model,
    Column,
    DataType,
    AutoIncrement,
    PrimaryKey,
    AllowNull,
    HasMany,
    ForeignKey,
    BelongsTo
} from 'sequelize-typescript'
import { Store } from './store.model'
import { Product } from './product.model'

@Table({
    timestamps: true,
    tableName: 'sub_store'
})
export class SubStore extends Model {
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
        allowNull: false
    })
    name!: string

    @ForeignKey(() => Store)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'store_id'
    })
    storeId!: number

    @BelongsTo(() => Store)
    store!: Store

    @HasMany(() => Product, {
        as: 'products',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    products!: Product[]
}
