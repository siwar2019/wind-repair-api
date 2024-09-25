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
    BelongsTo
} from 'sequelize-typescript'
import { User } from './user.model'
import { NotificationPriority, NotificationType } from '../utils/constant'

@Table({
    timestamps: true,
    tableName: 'notifications'
})
export class Notification extends Model {
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
    messageEn!: string

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    messageFr!: string

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: NotificationType.INFO,
        values: [NotificationType.INFO, NotificationType.SUCCESS, NotificationType.WARNING, NotificationType.ERROR]
    })
    type!: string

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    status!: boolean

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: NotificationPriority.MEDIUM,
        values: [NotificationPriority.LOW, NotificationPriority.MEDIUM, NotificationPriority.HIGH]
    })
    priority!: string

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'user_id'
    })
    userId!: number

    @BelongsTo(() => User)
    user!: User
}
