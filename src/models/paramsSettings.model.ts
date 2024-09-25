import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, AllowNull, BelongsTo, ForeignKey } from 'sequelize-typescript'
import { Settings } from './settings.model'
import { TypeParamsSetting } from '../utils/constant'

@Table({
    timestamps: true,
    tableName: 'params_settings'
})
export class ParamsSettings extends Model {
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

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        values: [TypeParamsSetting.BOOLEAN, TypeParamsSetting.INTEGER, TypeParamsSetting.STRING]
    })
    type!: string

    @ForeignKey(() => Settings)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'setting_id'
    })
    settingId!: number

    @BelongsTo(() => Settings)
    setting!: Settings
}
