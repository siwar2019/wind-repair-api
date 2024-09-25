import {
    Table,
    Model,
    Column,
    DataType,
    AutoIncrement,
    PrimaryKey,
    AllowNull,
    NotEmpty,
    ForeignKey,
    BelongsTo,
    HasMany
} from 'sequelize-typescript'
import { User } from './user.model'
import { EndPointType } from '../utils/constant'
import { ParamsSettings } from './paramsSettings.model'

@Table({
    timestamps: true,
    tableName: 'settings'
})
export class Settings extends Model {
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

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'end_point_test'
    })
    endPointTest!: string

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'end_point_prod'
    })
    endPointProd!: string

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'type_end_point',
        values: [EndPointType.GET, EndPointType.POST, EndPointType.PATCH, EndPointType.DELETE]
    })
    typeEndPoint!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    path!: string

    @AllowNull(true)
    @Column({
        type: DataType.TEXT,
        allowNull: true
    })
    output!: string

    @AllowNull(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    isAuth!: boolean

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    username!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    password!: string

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

    @HasMany(() => ParamsSettings, {
        as: 'paramsSettings',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    paramsSettings!: ParamsSettings[]
}
