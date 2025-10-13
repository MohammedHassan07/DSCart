import express from 'express'
import 'dotenv/config'
import connectDataBase from './config/db.js'
import http from 'http'
import socket from './config/socket.js'
import jwt from 'jsonwebtoken'
import morgan from 'morgan'

const app = express()
app.use(express.json())
app.use(morgan('dev'))

const httpServer = http.createServer(app)
const io = socket.initSocket(httpServer)

const PORT = process.env.PORT
httpServer.listen(PORT, () => {
    console.log(`HTTP + WS server on ${PORT}`);
    connectDataBase();
});

// Socket connection
io.use((socket, next) => {

    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    try {

        const payload = jwt.verify(token, process.env.SECRET_KEY);

        // socket.join(payload.userId);     
        socket.userId = payload.userId;
        next();
    } catch (e) {
        next(new Error('unauthorised'));
    }
});

io.on('connection', socket => {

    try {

        console.log('socket connected')
    } catch (error) {
        console.log(error)
    }
});

// API Routes
import userRoutes from './routes/user.routes.js'
import productRoutes from './routes/product.routes.js'
import adminRoutes from './routes/admin.routes.js'
import orderRoutes from './routes/order.routes.js'
import deliverAmountRoute from './routes/deliveryAmount.routes.js'

app.use('/api/user', userRoutes)
app.use('/api/product', productRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/charge', deliverAmountRoute)