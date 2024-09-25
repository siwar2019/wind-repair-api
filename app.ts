import express, { Application } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import swaggerUi from 'swagger-ui-express'
import { dbName, sequelize } from './src/config/db'
// common
import { Paths } from './src/common/paths'
// config
import { swaggerDocument } from './src/config/swagger/swagger'
import productRoutes from './src/routes/product.route'
import { initializeDatabase } from './src/common/functions'
import authRoutes from './src/routes/auth.route'
import roleRoutes from './src/routes/role.route'
import userRoutes from './src/routes/user.route'
import menuRoutes from './src/routes/menu.route'
import typeRoutes from './src/routes/type.route'
import ticketRoutes from './src/routes/ticket.route'
import invoiceRoutes from './src/routes/invoice.route'
import partnerRoutes from './src/routes/partner.route'
import cashRegisterRoutes from './src/routes/cashRegister.route'
import movementRoutes from './src/routes/movement.route'
import paymentRoutes from './src/routes/payment.route'
import subscriptionRoutes from './src/routes/subscription.route'
import statisticRoutes from './src/routes/statistic.route'
import settingsRoutes from './src/routes/settings.route'
import { createServer } from 'http'
import { Server } from 'socket.io'
import notificationRoutes from './src/routes/notification.route'
import storeRoutes from './src/routes/store.route'

const app: Application = express()
const server = createServer(app)

dotenv.config()

const io = new Server(server, {
    cors: {
        origin: process.env.HOST_FRONT,
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
})

app.use(express.urlencoded({ extended: true }))

app.use(bodyParser.json({ limit: '50mb' }))
app.use(cors())

app.use(Paths.API_DOC, swaggerUi.serve, swaggerUi.setup(swaggerDocument))

/**
 * @description Routes
 */

app.use(Paths.PRODUCT, productRoutes)
app.use(Paths.AUTH, authRoutes)
app.use(Paths.PARTNER, partnerRoutes)
app.use(Paths.MENU, menuRoutes)
app.use(Paths.ROLE, roleRoutes)
app.use(Paths.USER, userRoutes)
app.use(Paths.TYPE, typeRoutes)
app.use(Paths.TICKET, ticketRoutes)
app.use(Paths.INVOICE, invoiceRoutes)
app.use(Paths.CASH_REGISTER, cashRegisterRoutes)
app.use(Paths.MOVEMENT, movementRoutes)
app.use(Paths.PAYMENT, paymentRoutes)
app.use(Paths.SUBSCRIPTION, subscriptionRoutes)
app.use(Paths.STATISTIC, statisticRoutes)
app.use(Paths.SETTINGS, settingsRoutes)
app.use(Paths.NOTIFICATIONS, notificationRoutes)
app.use(Paths.STORE, storeRoutes)

const userSocketMap = new Map<number, string>()

io.on('connection', (socket) => {
    socket.on('register', (userId: number) => {
        userSocketMap.set(userId, socket.id)
    })

    socket.on('disconnect', () => {
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId)
                break
            }
        }
    })
})

const port = process.env.PORT || 3001

sequelize
    .sync({ alter: true })
    .then(async () => {
        console.log(`${dbName} is connected!`)
        await initializeDatabase()
        server.listen(port, () => {
            console.log(`server is listening on ${port}`)
        })
    })
    .catch((err) => {
        console.error(err)
    })

export { app, io, userSocketMap }
