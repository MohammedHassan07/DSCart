import express from 'express'
import verfiyToken from '../middleware/verifyToken.js'
import {
    createOrder,
    getAllOrders,
    getOrderByDate,
    getOrderById,
    getOrdersByCategory,
    getOrdersByName
} from '../controller/order.controller.js'

const route = express.Router()

route.use(verfiyToken)

route.post('/create', createOrder)

route.get('/', getAllOrders)

route.get('/category/:category', getOrdersByCategory)

route.get('/name/:name', getOrdersByName)

route.get('/id/:id', getOrderById)

route.get('/date', getOrderByDate)

export default route