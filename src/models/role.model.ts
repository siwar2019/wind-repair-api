import {
    Table,
    Model,
    Column,
    DataType,
    AutoIncrement,
    PrimaryKey,
    NotEmpty,
    AllowNull,
    BelongsToMany,
    ForeignKey,
    BelongsTo,
    HasMany
} from 'sequelize-typescript'
import { User } from './user.model'
import { UserRole } from './userRole.model'

@Table({
    timestamps: true,
    tableName: 'roles'
})
export class Role extends Model {
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

    @Column({
        type: DataType.BOOLEAN,
        field: 'is_deleted',
        defaultValue: false
    })
    isDeleted!: boolean

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'created_by'
    })
    createdBy!: number

    @BelongsTo(() => User)
    employee!: User

    // ------------------------ HasMany Relations ---------------------------

    @BelongsToMany(() => User, () => UserRole)
    user!: User[]
}
