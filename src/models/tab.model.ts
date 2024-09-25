import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, NotEmpty, AllowNull } from 'sequelize-typescript'

@Table({
    timestamps: true,
    tableName: 'tabs'
})
export class Tab extends Model {
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
}
