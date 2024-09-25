import { Table, Model, Column, DataType, ForeignKey, PrimaryKey, AutoIncrement } from 'sequelize-typescript'
import { Role } from './role.model'
import { User } from './user.model'

@Table({
    timestamps: true,
    tableName: 'userrole'
})
export class UserRole extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    id!: number

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'user_id'
    })
    userId!: number

    @ForeignKey(() => Role)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'role_id'
    })
    roleId!: number
}
