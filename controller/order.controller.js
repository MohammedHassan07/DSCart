import orderModel from "../models/order.model.js"
import { Types } from "mongoose"
import socket from "../config/socket.js"
import orderService from '../services/order.service.js'

const createOrder = async (req, res) => {

    try {

        const { products, totalPrice, deliveryCharge, address, netTotal, userName, userEmail, totalQuantity } = req.body

        const userId = req.userId

        if (!products || products.length < 1 || !totalPrice || deliveryCharge == null || !address || !netTotal || !totalQuantity || !userName || !userEmail) {
            return res.status(400).json({ flag: false, message: 'All fields are required' })
        }

        const lastOrder = await orderService.lastOrderService()
        let nextNumber = 1
        const codePrefix = 'OR'
        if (lastOrder && lastOrder.orderNumber) {

            const lastNum = parseInt(lastOrder.orderNumber.replace(codePrefix, ''), 10);
            nextNumber = lastNum + 1;
        }

        const newOrder = {
            userId,
            totalPrice,
            address,
            deliveryCharge,
            netTotal,
            totalQuantity,
            orderNumber: codePrefix + String(nextNumber).padStart(6, '0')
        }
        const savedOrder = await orderService.createOrderService(newOrder)

        let newOrderHistory = []
        for (const product of products) {

            const ord = {

                userId: new Types.ObjectId(userId),
                userName: userName,
                userEmail: userEmail,
                productName: product.productName,
                productCategory: product.productCategory,
                productPrice: product.productPrice,
                totalPrice: product.totalPrice,
                productQuantity: product.productQuantity,
                orderNumber: codePrefix + String(nextNumber).padStart(6, '0'),
                orderId: savedOrder._id,
            }

            newOrderHistory.push(ord)
        }

        const savedHistory = await orderService.insertManyOrderHistory(newOrderHistory);
        savedOrder.products = savedHistory;
        await savedOrder.save();

        res.status(201).json({ flag: true, message: 'Order created successfully', order: savedOrder })

        // TODO: implement realtime communication to send the npotification to the shop owner
        // const io = socket.getIo()

        // const user = await userModel.findOne({ _id: userId }).select(['-password', '-isAdmin'])

        // io.emit('order:creted', 'Order created successfully', { user, orderId: ord._id })
    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}

const getAllOrders = async (req, res) => {

    try {

        const userId = new Types.ObjectId(req.userId)

        const orders = await orderModel.find({ userId })
            .populate({ path: 'products', select: '-description -ingredients' })

        if (orders.length < 1) return res.status(404).json({ flag: false, message: 'No order found' })

        res.status(200).json({ flag: true, orders, message: 'orders found' })
    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }

}

const getOrdersByCategory = async (req, res) => {

    try {

        const userId = new Types.ObjectId(req.userId)
        const category = req.params.category

        const orders = await orderModel.aggregate([

            { $match: { userId } },
            {
                $lookup: {

                    from: 'products',
                    localField: 'products',
                    as: 'products',
                    foreignField: '_id'
                }
            },
            {
                $match: { 'products.category': category }
            },
            {
                $project: {

                    description: 0,
                    'products.description': 0,
                    'products.ingredients': 0
                }
            }
        ])

        // const orders = await orderModel.find({ userId })
        //     .populate({ path: 'products', select: '-description -ingredients' })

        if (orders.length < 1) return res.status(404).json({ flag: false, message: 'No orders found' })

        // const categoryOrders = orders.filter(order =>
        //     order.products.some(p => p.category === category))

        res.status(200).json({ flag: true, orders })

    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}

const getOrderById = async (req, res) => {

    try {

        const id = req.params.id

        const order = await orderModel.findOne({ _id: id }).populate({ path: 'products', select: '-ingredients -description' })

        // const orders = await orderModel.find({ userId })
        //     .populate({ path: 'products', select: '-description -ingredients' })

        if (!order) return res.status(404).json({ flag: false, message: 'No orders found' })

        // const categoryOrders = orders.filter(order =>
        //     order.products.some(p => p.category === category))

        res.status(200).json({ flag: true, order })

    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}

const getOrdersByName = async (req, res) => {

    try {

        const userId = new Types.ObjectId(req.userId)
        const name = req.params.name

        const orders = await orderModel.aggregate([

            { $match: { userId } },
            {
                $lookup: {

                    from: 'products',
                    localField: 'products',
                    as: 'products',
                    foreignField: '_id'
                }
            },
            {
                $match: { 'products.name': name }
            },
            {
                $project: {

                    description: 0,
                    'products.description': 0,
                    'products.ingredients': 0
                }
            }
        ])

        if (orders.length < 1) return res.status(404).json({ flag: false, message: 'No orders found' })

        res.status(200).json({ flag: true, orders })

    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}

const getOrderByDate = async (req, res) => {
    try {

        const userId = new Types.ObjectId(req.userId)
        const userDate = new Date(req.query.date)

        const month = userDate.getMonth() + 1
        const date = userDate.getUTCDate() + '-' + month + '-' + userDate.getFullYear()

        const orders = await orderModel.find({ userId })
            .populate({ path: 'products', select: '-description -ingredients' })

        if (orders.length < 1) return res.status(404).json({ flag: false, message: 'No orders found' })

        const filteredOrder = orders.filter(order => {

            let orderDate = new Date(order.createdAt)

            let month = orderDate.getMonth() + 1
            orderDate = orderDate.getUTCDate() + '-' + month + '-' + orderDate.getFullYear()

            if (date === orderDate)
                return order
        })

        if (filteredOrder.length < 1) return res.status(404).json({ flag: false, message: 'No orders found' })


        res.json({ flag: true, message: 'Order found', order: filteredOrder })

    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}

export {
    createOrder,
    getAllOrders,
    getOrdersByCategory,
    getOrderById,
    getOrdersByName,
    getOrderByDate
}