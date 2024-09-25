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
import { User } from './user.model'
import { SubStore } from './subStore.model'

@Table({
    timestamps: true,
    tableName: 'store'
})
export class Store extends Model {
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

    @Column({
        type: DataType.JSON,
        allowNull: false,
        defaultValue: []
    })
    columns!: string[]

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'nbr_lines'
    })
    nbrLines!: number

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

    @HasMany(() => SubStore, {
        as: 'subStores',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    subStores!: SubStore[]
}
