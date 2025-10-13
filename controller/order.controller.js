import orderModel from "../models/order.model.js"
import { Types } from "mongoose"
import socket from "../config/socket.js"
import orderService from '../services/order.service.js'
import responseHandler from "../utils/responseHandler.js"
import constants from "../config/constants.js"
import sendFCM from '../utils/sendFCM.js'
import userService from "../services/user.service.js"

const createOrder = async (req, res) => {

    try {

        const { products, totalPrice, deliveryCharge, address, netTotal, userName, userEmail, totalQuantity } = req.body

        const userId = req.userId

        if (!products || products.length < 1 || !totalPrice || !deliveryCharge || !address || !netTotal || !totalQuantity || !userName || !userEmail) {

            return responseHandler(res, constants.BAD_REQUEST, 'failed', 'All fields are required')
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
                productId: new Types.ObjectId(product.productId),
            }

            newOrderHistory.push(ord)
        }

        const savedHistory = await orderService.insertManyOrderHistory(newOrderHistory);
        savedOrder.products = savedHistory;
        await savedOrder.save();

        // send FCM
        const title = 'New Order Received!'
        const body = `A new order has been placed by ${userName}.`

        const filter = {
            isAdmin: true
        }
        const admin = await userService.findAdmin(filter)

        await sendFCM(admin.FCMToken, title, body)
        responseHandler(res, constants.CREATED, 'success', 'Order created successfully', savedOrder)

        // TODO: implement realtime communication to send the npotification to the shop owner
        // const io = socket.getIo()
        // const user = await userModel.findOne({ _id: userId }).select(['-password', '-isAdmin'])
        // io.emit('order:creted', 'Order created successfully', { user, orderId: ord._id })
    } catch (error) {

        responseHandler(res, constants.BAD_REQUEST, 'failed', error.message)
        console.log(error)
    }
}

const getAllOrders = async (req, res) => {

    try {

        let { page, limit, search } = req.body
        const userId = new Types.ObjectId(req.userId)

        let filter = {}
        if (!req.role)
            filter.userId = userId

        page = parseInt(page);
        limit = parseInt(limit);
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

        if (search && search.trim() !== "") {
            const searchRegex = { $regex: search, $options: "i" };
            filter.$or = [
                { "products.productName": searchRegex },
                { "products.productCategory": searchRegex },
                { orderNumber: searchRegex },
            ];
        }
        const { orders, totalOrders, totalPages } = await orderService.getAllOrderService(filter, page, limit)

        if (!orders || orders.lenght < 1) return responseHandler(res, constants.OK, 'failed', 'Orders not found')

        responseHandler(res, constants.OK, 'success', 'Orders found', { orders, totalOrders, totalPages })
    } catch (error) {
        responseHandler(res, constants.BAD_REQUEST, 'failed', error.message)
        console.log(error)
    }

}

const getOrderDetails = async (req, res) => {

    const userId = new Types.ObjectId(req.userId)

    // const order = await 

}

// const getOrdersByCategory = async (req, res) => {

//     try {

//         const userId = new Types.ObjectId(req.userId)
//         const category = req.params.category

//         const orders = await orderModel.aggregate([

//             { $match: { userId } },
//             {
//                 $lookup: {

//                     from: 'products',
//                     localField: 'products',
//                     as: 'products',
//                     foreignField: '_id'
//                 }
//             },
//             {
//                 $match: { 'products.category': category }
//             },
//             {
//                 $project: {

//                     description: 0,
//                     'products.description': 0,
//                     'products.ingredients': 0
//                 }
//             }
//         ])

//         // const orders = await orderModel.find({ userId })
//         //     .populate({ path: 'products', select: '-description -ingredients' })

//         if (orders.length < 1) return res.status(404).json({ status: 'failed', message: 'No orders found' })

//         // const categoryOrders = orders.filter(order =>
//         //     order.products.some(p => p.category === category))

//         res.status(200).json({ status: 'success', orders })

//     } catch (error) {

//         res.status(500).json({ status: 'failed', message: 'Internal Server Error' })
//         console.log(error)
//     }
// }

// const getOrderById = async (req, res) => {

//     try {

//         const id = req.params.id

//         const order = await orderModel.findOne({ _id: id }).populate({ path: 'products', select: '-ingredients -description' })

//         // const orders = await orderModel.find({ userId })
//         //     .populate({ path: 'products', select: '-description -ingredients' })

//         if (!order) return res.status(404).json({ status: 'failed', message: 'No orders found' })

//         // const categoryOrders = orders.filter(order =>
//         //     order.products.some(p => p.category === category))

//         res.status(200).json({ status: 'success', order })

//     } catch (error) {

//         res.status(500).json({ status: 'failed', message: 'Internal Server Error' })
//         console.log(error)
//     }
// }

// const getOrdersByName = async (req, res) => {

//     try {

//         const userId = new Types.ObjectId(req.userId)
//         const name = req.params.name

//         const orders = await orderModel.aggregate([

//             { $match: { userId } },
//             {
//                 $lookup: {

//                     from: 'products',
//                     localField: 'products',
//                     as: 'products',
//                     foreignField: '_id'
//                 }
//             },
//             {
//                 $match: { 'products.name': name }
//             },
//             {
//                 $project: {

//                     description: 0,
//                     'products.description': 0,
//                     'products.ingredients': 0
//                 }
//             }
//         ])

//         if (orders.length < 1) return res.status(404).json({ status: 'failed', message: 'No orders found' })

//         res.status(200).json({ status: 'success', orders })

//     } catch (error) {

//         res.status(500).json({ status: 'failed', message: 'Internal Server Error' })
//         console.log(error)
//     }
// }

// const getOrderByDate = async (req, res) => {
//     try {

//         const userId = new Types.ObjectId(req.userId)
//         const userDate = new Date(req.query.date)

//         const month = userDate.getMonth() + 1
//         const date = userDate.getUTCDate() + '-' + month + '-' + userDate.getFullYear()

//         const orders = await orderModel.find({ userId })
//             .populate({ path: 'products', select: '-description -ingredients' })

//         if (orders.length < 1) return res.status(404).json({ status: 'failed', message: 'No orders found' })

//         const filteredOrder = orders.filter(order => {

//             let orderDate = new Date(order.createdAt)

//             let month = orderDate.getMonth() + 1
//             orderDate = orderDate.getUTCDate() + '-' + month + '-' + orderDate.getFullYear()

//             if (date === orderDate)
//                 return order
//         })

//         if (filteredOrder.length < 1) return res.status(404).json({ status: 'failed', message: 'No orders found' })


//         res.json({ status: 'success', message: 'Order found', order: filteredOrder })

//     } catch (error) {

//         res.status(500).json({ status: 'failed', message: 'Internal Server Error' })
//         console.log(error)
//     }
// }

export default {
    createOrder,
    getAllOrders,
    getOrderDetails
    // getOrdersByCategory,
    // getOrderById,
    // getOrdersByName,
    // getOrderByDate
}