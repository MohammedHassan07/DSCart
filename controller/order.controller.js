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

        const { products, totalPrice, address, netTotal, userName, userEmail, totalQuantity } = req.body

        const userId = req.userId

        if (!products || products.length < 1 || !totalPrice || !address || !netTotal || !totalQuantity || !userName || !userEmail) {

            return responseHandler(res, constants.BAD_REQUEST, 'failed', 'All fields are required')
        }

        const lastOrder = await orderService.lastOrderService()
        let nextNumber = 1
        const codePrefix = 'OR'
        if (lastOrder && lastOrder.orderNumber) {

            const lastNum = parseInt(lastOrder.orderNumber.replace(codePrefix, ''), 10);
            nextNumber = lastNum + 1;
        }

        const deliveryCharge = req.body.deliveryCharge || 0
        const newOrder = {
            userId,
            userName: userName,
            userEmail: userEmail,
            totalPrice,
            address,
            deliveryCharge: deliveryCharge,
            netTotal,
            totalQuantity,
            orderNumber: codePrefix + String(nextNumber).padStart(6, '0')
        }
        const savedOrder = await orderService.createOrderService(newOrder)

        let newOrderHistory = []
        for (const product of products) {

            const ord = {

                userId: new Types.ObjectId(userId),
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
        savedOrder.orderHistory = savedHistory.map(h => h._id);;
        await savedOrder.save();

        // send FCM
        const title = 'New Order Received!'
        const body = `A new order has been placed by ${userName}.`

        const filter = {
            isAdmin: true
        }
        const admin = await userService.findAdmin(filter)

        // await sendFCM(admin.FCMToken, title, body)
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

// pagination
const getAllOrders = async (req, res) => {

    try {

        let { page, limit, search } = req.body
        const userId = new Types.ObjectId(req.userId)

        let filter = {
            isDeleted: false
        }
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

// update order
const updateOrder = async (req, res) => {
    try {

        const { products, totalPrice, address, netTotal, userName, userEmail, totalQuantity, orderId } = req.body

        const userId = req.userId

        if (!products || products.length < 1 || !totalPrice || !address || !netTotal || !totalQuantity || !userName || !userEmail || !orderId) {

            return responseHandler(res, constants.BAD_REQUEST, 'failed', 'All fields are required')
        }

        const history = []
        for (const product of products) {

            const orderHistoryFilter = {
                userId: new Types.ObjectId(userId),
                orderId: new Types.ObjectId(orderId),
                productId: new Types.ObjectId(product.productId),
                isDeleted: false
            }
            const orderHistory = await orderService.updateOrderHistoryService(orderHistoryFilter, product)

            history.push(orderHistory)
        }

        const data = {

            totalPrice: totalPrice,
            address: address,
            netTotal: netTotal,
            totalQuantity: totalQuantity,
        }

        const orderFilter = {
            userId: new Types.ObjectId(userId),
            _id: new Types.ObjectId(orderId),
            isDeleted: false
        }
        const updatedOrder = await orderService.updateOrderService(orderFilter, data)

        if (!updatedOrder) {
            return responseHandler(res, constants.BAD_REQUEST, 'failed', 'Order not found')
        }

        // send FCM
        const title = 'Order updated'
        const body = `Order has been updated by ${userName}.`

        const filter = {
            isAdmin: true
        }
        const admin = await userService.findAdmin(filter)

        // await sendFCM(admin.FCMToken, title, body)

        updatedOrder.orderHistory = history
        return responseHandler(
            res,
            constants.OK,
            "success",
            "Order updated successfully",
            updatedOrder
        );
    } catch (error) {
        console.log(error)
        return responseHandler(res, constants.BAD_REQUEST, 'failed', error.message)
    }
}

// delete order
const deleteOrder = async (req, res) => {

    const userId = req.userId

    const { orderId } = req.body

    if (!orderId) {
        return responseHandler(res, constants.BAD_REQUEST, 'failed', 'Order is required')
    }

    const orderFilter = {
        _id: new Types.ObjectId(orderId),
        userId: new Types.ObjectId(userId)
    }
    const deletedOrder = await orderService.updateOrderService(orderFilter, { isDeleted: true })

    if (!deletedOrder) {

        return responseHandler(res, constants.BAD_REQUEST, 'failed', 'Order not found')
    }

    const history = []
    for (const historyOrder of deletedOrder.orderHistory) {

        const orderHistoryFilter = {
            userId: new Types.ObjectId(userId),
            orderId: new Types.ObjectId(orderId),
            _id: new Types.ObjectId(historyOrder)
        }
        const orderHistory = await orderService.updateOrderHistoryService(orderHistoryFilter, { isDeleted: true })

        history.push(orderHistory)
    }

    // send FCM
    const title = 'Order updated'
    const body = `Order has been updated by ${userName}.`

    const filter = {
        isAdmin: true
    }
    const admin = await userService.findAdmin(filter)

    // await sendFCM(admin.FCMToken, title, body)

    deletedOrder.orderHistory = history
    return responseHandler(res, constants.OK, 'success', 'Order deleted', deletedOrder)

}

// delete order item
const deleteOrderItem = async (req, res) => {

    const userId = req.userId

    const { orderId, productId } = req.body

    if (!orderId || !productId) {
        return responseHandler(res, constants.BAD_REQUEST, 'failed', 'Order is required')
    }

    const orderFilter = {
        _id: new Types.ObjectId(orderId),
        userId: new Types.ObjectId(userId)
    }

    const orderHistoryFilter = {
        userId: new Types.ObjectId(userId),
        orderId: new Types.ObjectId(orderId),
        _id: new Types.ObjectId(historyOrder)
    }

}

export default {
    createOrder,
    getAllOrders,
    getOrderDetails,
    updateOrder,
    deleteOrder,
    deleteOrderItem
}