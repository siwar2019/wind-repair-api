import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, AllowNull, HasMany } from 'sequelize-typescript'
import { User } from './user.model'

@Table({
    timestamps: true,
    tableName: 'type'
})
export class Type extends Model {
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

    @HasMany(() => User, {
        as: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    users!: User[]
}
