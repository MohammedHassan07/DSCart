import orderModel from "../models/order.model.js"
import { Types } from "mongoose"
import socket from "../config/socket.js"
import orderService from '../services/order.service.js'
import responseHandler from "../utils/responseHandler.js"
import constants from "../config/constants.js"
import sendFCM from '../utils/sendFCM.js'
import userService from "../services/user.service.js"
import inventoryService from '../services/inventory.service.js'

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

// TODO: add filter for isCanceled
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

const cancelOrder = async (req, res) => {
    try {

        const userId = req.userId
        const { products, totalPrice, netTotal, userName, userEmail, totalQuantity, inventoryType } = req.body

        if (!products || products.length < 1 || !totalPrice || !netTotal || !totalQuantity || !userName || !userEmail || !inventoryType) {

            return responseHandler(res, constants.BAD_REQUEST, 'failed', 'All fields are required')
        }

        const order = await orderService.getOrderDetailsService(filter)

        if (!order) {
            return responseHandler(res, constants.BAD_REQUEST, 'failed', 'Order not found')
        }
        // next number 
        const lastInventory = await inventoryService.lastInventoryService()
        let nextNumber = 1
        const codePrefix = 'INV'
        if (lastInventory && lastInventory.orderNumber) {

            const lastNum = parseInt(lastInventory.inventoryNumber.replace(codePrefix, ''), 10);
            nextNumber = lastNum + 1;
        }

        const newInventory = {
            userId: new Types.ObjectId(userId),
            userName: userName,
            userEmail: userEmail,
            totalPrice,
            netTotal,
            totalQuantity,
            inventoryNumber: codePrefix + String(nextNumber).padStart(6, '0')
        }
        const savedInventory = await inventoryService.addInventoryService(newInventory)

        let newInventoryHistory = []
        for (const product of products) {

            const ord = {

                userId: new Types.ObjectId(userId),
                productName: product.productName,
                productCategory: product.productCategory,
                productPrice: product.productPrice,
                totalPrice: product.totalPrice,
                productQuantity: product.productQuantity,
                inventoryNumber: codePrefix + String(nextNumber).padStart(6, '0'),
                orderId: savedInventory._id,
                productId: new Types.ObjectId(product.productId),
            }

            newInventoryHistory.push(ord)
        }

        const savedHistory = await inventoryService.addInventoryHistoryService(newInventoryHistory);
        savedInventory.products = savedHistory;
        await savedInventory.save();



        const updatedProducts = order.products.filter(
            (product) => product.productId.toString() !== productId.toString())

        const removedProduct = order.products.find(
            (product) => product.productId.toString() === productId.toString());


        if (updatedProducts.length === order.products.length) {
            return responseHandler(res, constants.BAD_REQUEST, 'failed', 'Product not found in this order');
        }

        updatedProducts.forEach((p) => {
            totalPrice += p.totalPrice || 0;
            totalQuantity += p.productQuantity || 0;
            netTotal = totalPrice
        });

        // order.products = updatedProducts;
        // order.totalPrice = totalPrice;
        // order.totalQuantity = totalQuantity;
        // order.netTotal = netTotal + order.deliveryCharge

        order.isCancelled = true
        await order.save();


        // send FCM
        const title = 'Order Cancelled!'
        const body = `Order has been cancelled by ${userName}.`
        const admin = await userService.findAdmin({ isAdmin: true })

        await sendFCM(admin.FCMToken, title, body)

        return responseHandler(res, constants.OK, 'success', 'Order cancelled  successfully', { order, cancelledProduct: removedProduct });

    } catch (error) {
        responseHandler(res, constants.BAD_REQUEST, 'failed', error.message)
        console.log(error)
    }
}

export default {
    createOrder,
    getAllOrders,
    getOrderDetails,
    cancelOrder
    // getOrdersByCategory,
    // getOrderById,
    // getOrdersByName,
    // getOrderByDate
}