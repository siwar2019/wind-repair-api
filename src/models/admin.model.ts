import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, NotEmpty, AllowNull } from 'sequelize-typescript'

@Table({
    timestamps: true,
    tableName: 'admin'
})
export class Admin extends Model {
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
        unique: 'column'
    })
    email!: string

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    password!: string
}
