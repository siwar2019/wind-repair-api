import { Table, Model, Column, ForeignKey, DataType, PrimaryKey, AutoIncrement, AllowNull, BelongsTo } from 'sequelize-typescript'
import { Button } from './button.model'
import { Menu } from './menu.model'
import { Role } from './role.model'

@Table({
    timestamps: true,
    tableName: 'menus_role'
})
export class MenusRole extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    id!: number

    @AllowNull(true)
    @ForeignKey(() => Button)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'button_id'
    })
    buttonId!: number

    @BelongsTo(() => Button)
    button!: Button

    @AllowNull(true)
    @ForeignKey(() => Menu)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'menu_id'
    })
    menuId!: number

    @BelongsTo(() => Menu)
    menu!: Menu

    @ForeignKey(() => Role)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'role_id'
    })
    roleId!: number

    @BelongsTo(() => Role)
    role!: Role

    @AllowNull(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false
    })
    checked!: boolean
}
