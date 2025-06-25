import orderModel from "../models/order.model.js"

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

        const userId = req.userId

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