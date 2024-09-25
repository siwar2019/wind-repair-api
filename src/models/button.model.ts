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
    HasMany
} from 'sequelize-typescript'
import { MenusRole } from './menusRole.model'
import { Menu } from './menu.model'

@Table({
    timestamps: true,
    tableName: 'buttons'
})
export class Button extends Model {
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
    @ForeignKey(() => Menu)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'menu_id'
    })
    menuId!: number

    @BelongsTo(() => Menu)
    menu!: Menu

    @HasMany(() => MenusRole, {
        as: 'menusrole',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    menusRole!: MenusRole[]

    // ------------------------ HasMany Relations ---------------------------
}
