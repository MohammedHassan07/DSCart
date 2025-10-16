import express from 'express'
import verfiyToken from '../middleware/verifyToken.js'
import orders from '../controller/order.controller.js'

const route = express.Router()

route.use(verfiyToken)

route.post('/create', orders.createOrder)

route.post('/get-orders', orders.getAllOrders)

route.post('/update-order', orders.updateOrder)

route.delete('/delete-order', orders.deleteOrder)

route.delete('/delete-order-item', orders.deleteOrderItem)

export default route