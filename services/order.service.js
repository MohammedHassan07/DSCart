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

// pagination
async function getAllOrderService(filter, page, limit) {

    const result = await orderModel.aggregate([
        { $match: filter },
        {
            $lookup: {
                from: "orderhistories",
                localField: "_id",
                foreignField: "orderId",
                as: "products"
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                ],
            },
        },
    ])

    const orders = result[0]?.data || [];
    const totalOrders = result[0]?.metadata[0]?.total || 0;
    const totalPages = Math.ceil(totalOrders / limit);

    return { orders, totalOrders, totalPages }
}

// get order 
async function getOrderDetailsService(filter) {

    const order = await orderModel.findOne(filter)

    return order
}

// get order history details
async function deleteOrderHistoryDetailsService(filter) {

    const orderHistory = await orderHistoryModel.deleteOne(filter)

    return orderHistory
}




export default {
    insertManyOrderHistory,
    lastOrderService,
    createOrderService,
    getAllOrderService,
    getOrderDetailsService,
    deleteOrderHistoryDetailsService
}