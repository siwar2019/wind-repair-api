import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, NotEmpty, AllowNull, HasMany } from 'sequelize-typescript'
import { Button } from './button.model'
import { MenusRole } from './menusRole.model'

@Table({
    timestamps: true,
    tableName: 'menus'
})
export class Menu extends Model {
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
        allowNull: false,
        unique: 'column'
    })
    name!: string

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: 'column',
        field: 'action_id'
    })
    actionId!: string

    // ------------------------  HasOne Relations ---------------------------

    // ------------------------ HasMany Relations ---------------------------

    @HasMany(() => Button, {
        as: 'buttons',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    buttons!: Button[]

    @HasMany(() => MenusRole, {
        as: 'menusrole',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    menusRole!: MenusRole[]
}
