import express from 'express'
import verfiyToken from '../middleware/verifyToken.js'
import orders from '../controller/order.controller.js'

const route = express.Router()

route.use(verfiyToken)

route.post('/create', orders.createOrder)

route.post('/get-orders', orders.getAllOrders)

route.post('/cancel-order', orders.cancelOrder)

// route.post('/get-order-details', orders.getOrderDetails)

// route.get('/category/:category', getOrdersByCategory)

// route.get('/name/:name', getOrdersByName)

// route.get('/id/:id', getOrderById)

// route.get('/date', getOrderByDate)

export default route