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
    HasOne
} from 'sequelize-typescript'
import { Product } from './product.model'
import { Invoice } from './invoice.model'

@Table({
    timestamps: true,
    tableName: 'repairticket'
})
export class RepairTicket extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    id!: number

    @AllowNull(true)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    payed!: boolean

    @AllowNull(true)
    @NotEmpty
    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'start_date'
    })
    startDate!: Date | null

    @AllowNull(true)
    @NotEmpty
    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'end_date'
    })
    endDate!: Date | null

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.FLOAT,
        allowNull: false,
        field: 'estimated_cost'
    })
    estimatedCost!: number

    @AllowNull(true)
    @NotEmpty
    @Column({
        type: DataType.FLOAT,
        allowNull: true,
        field: 'total_cost'
    })
    totalCost!: number

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'estimated_time'
    })
    estimatedTime!: number

    @AllowNull(true)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    description!: string

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: 'column'
    })
    code!: string

    // ------------------------  HasOne Relations ---------------------------
    @ForeignKey(() => Product)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'product_id'
    })
    productId!: number

    @BelongsTo(() => Product)
    product!: Product

    // ------------------------ HasMany Relations ---------------------------

    @HasOne(() => Invoice, {
        as: 'invoice',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    invoice!: Invoice
}
