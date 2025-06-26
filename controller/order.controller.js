import orderModel from "../models/order.model.js"
import { Types } from "mongoose"
import socket from "../config/socket.js"
import userModel from "../models/user.model.js"

const createOrder = async (req, res) => {

    try {

        const { products, rate, deliveryCharge, address } = req.body

        const userId = req.userId

        if (!products || !rate || !deliveryCharge || !address) return res.status(400).json({ flag: false, message: 'All fields are required' })

        // implement realtime communication to send the npotification to the shop owner
        const newOrder = new orderModel({ userId, products, rate, address, deliveryCharge })

        const ord = await newOrder.save()

        console.log(ord)

        res.status(201).json({ flag: true, message: 'Order created successfully' })

        const io = socket.getIo()

        const user = await userModel.findOne({ _id: userId }).select(['-password', '-isAdmin'])

        io.emit('order:creted', 'Order created successfully', { user, orderId: ord._id })


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

        const order = await orderModel.findOne({_id: id}).populate({path: 'products', select: '-ingredients -description'})

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