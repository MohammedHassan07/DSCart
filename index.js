import express from 'express'
import 'dotenv/config'
import connectDataBase from './config/db.js'

const app = express()

app.use(express.json())

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server is up at ${PORT}`)
    connectDataBase()
})

import userRoutes from './routes/user.routes.js'
import productRoutes from './routes/product.routes.js'

app.use('/api/user', userRoutes)
app.use('/api/product', productRoutes)