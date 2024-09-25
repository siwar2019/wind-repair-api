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
    Model,
    HasMany
} from 'sequelize-typescript'
import { User } from './user.model'
import { Movement } from './movement.model'

@Table({
    timestamps: true,
    tableName: 'cashRegister'
})
export class CashRegister extends Model {
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
    name!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'bank_account'
    })
    bankAccount!: string

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.FLOAT,
        allowNull: false,
        defaultValue: 0
    })
    initialValue!: number

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    status!: boolean

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    main!: boolean

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.FLOAT,
        allowNull: false,
        defaultValue: 0
    })
    total!: number

    @ForeignKey(() => User)
    @AllowNull(true)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'user_id'
    })
    userId!: number

    @BelongsTo(() => User)
    user!: User

    @HasMany(() => Movement, {
        as: 'movement',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    movements!: Movement[]
}
