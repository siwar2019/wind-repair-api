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
    BelongsTo
} from 'sequelize-typescript'
import { User } from './user.model'

@Table({
    timestamps: true,
    tableName: 'erp_settings'
})
export class ErpSettings extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    id!: number

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'uuid_customer'
    })
    uuidCustomer!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'uuid_caisse'
    })
    uuidCaisse!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'uuid_compte_bancaire'
    })
    uuidCompteBancaire!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'uuid_currency'
    })
    uuidCurrency!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'uuid_bank_account_customer'
    })
    uuidBankAccountCustomer!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'uuid_partner'
    })
    uuidPartner!: string

    @AllowNull(true)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'tenant_id_partner'
    })
    tenantIdPartner!: string

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
}
