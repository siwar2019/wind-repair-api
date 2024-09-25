import swaggerJsDoc from 'swagger-jsdoc'
import dotenv from 'dotenv'

dotenv.config()

const swaggerOptions = {
    definition: {
        swagger: '2.0',
        info: {
            title: 'title',
            version: '1.0.0',
            description: 'description'
        },
        contact: {
            name: 'name',
            email: process.env.EMAIL || 'name@gmail.com'
        },
        servers: [
            {
                url: process.env.BASE_URL_SWAGGER
            }
        ],
        schemes: ['http', 'https']
    },

    apis: ['**/*.route.ts']
}

export const swaggerDocument = swaggerJsDoc(swaggerOptions)
