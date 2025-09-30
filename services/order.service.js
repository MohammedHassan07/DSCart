import orderModel from "../models/order.model.js";
import orderHistoryModel from "../models/orderHistory.model.js";

async function insertManyOrderHistory(data) {

    const products = await orderHistoryModel.insertMany(data)

    return products
}

// find last order
async function lastOrderService() {

    const lastOrder = await orderModel.find().sort({ createdAt: -1 })

    return lastOrder
}

// create order
async function createOrderService(data) {

    const order = await orderModel.create(data)
    return order
}

export default {
    insertManyOrderHistory,
    lastOrderService,
    createOrderService
}