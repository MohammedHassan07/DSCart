import orderModel from "../models/order.model.js"
import { Types } from "mongoose"

const createOrder = async (req, res) => {

    try {

        const { products, rate, deliveryCharge, address } = req.body

        const userId = req.userId

        if (!products || !rate || !deliveryCharge || !address) return res.status(402).json({ flag: false, message: 'All fields are required' })

        // implement realtime communication to send the npotification to the shop owner
        const newOrder = new orderModel({ userId, products, rate, address, deliveryCharge })

        await newOrder.save()

        res.status(200).json({ flag: true, message: 'Order created successfully' })

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

        res.status(200).json({ flag: true, orders })
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

        // if (orders.length < 1) return res.status(404).json({ flag: false, message: 'No orders found' })

        // const categoryOrders = orders.filter(order =>
        //     order.products.some(p => p.category === category))

        res.status(200).json({ flag: true, orders })

    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}

const getOrdersByName = async (req, res) => {

    try {
    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}

export { createOrder, getAllOrders, getOrdersByCategory, getOrdersByName }