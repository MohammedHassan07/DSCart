import orderModel from "../models/order.model.js";
import orderHistoryModel from "../models/orderHistory.model.js";

async function insertManyOrderHistory(data) {

  const products = await orderHistoryModel.insertMany(data)

  return products
}

// find last order
async function lastOrderService() {

  const lastOrder = await orderModel.findOne().sort({ createdAt: -1 }).select('orderNumber')

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
        let: { orderId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$orderId", "$$orderId"] } } },
          { $match: { isCancelled: false } },
          // group by productId to merge duplicate entries
          {
            $group: {
              _id: "$productId",
              productId: { $first: "$productId" },
              productName: { $first: "$productName" },
              productCategory: { $first: "$productCategory" },
              productPrice: { $first: "$productPrice" },
              totalPrice: { $sum: "$totalPrice" }, // sum up totalPrice if duplicate
              productQuantity: { $sum: "$productQuantity" }, // sum up quantities
              createdAt: { $first: "$createdAt" },
              updatedAt: { $last: "$updatedAt" },
            },
          },
        ],
        as: "products",
      },
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
  ]);

  const orders = result[0]?.data || [];
  const totalOrders = result[0]?.metadata[0]?.total || 0;
  const totalPages = Math.ceil(totalOrders / limit);

  return { orders, totalOrders, totalPages };
}


// get order 
async function getOrderDetailsService(filter) {

  const order = await orderModel.findOne(filter)

  return order
}

// get order history service find one
async function getOrderHistoryService(filter) {
  const orderHistory = await orderHistoryModel.findOne(filter)
  return orderHistory
}

// get order histories find many
async function getAllOrderHistoryService(filter) {
  const orderHistories = await orderHistoryModel.find(filter)
  return orderHistories
}

// delete order history details
async function deleteOrderHistoryDetailsService(filter) {

  const orderHistory = await orderHistoryModel.deleteOne(filter)

  return orderHistory
}

// mark isCancelled true
async function markIsCancelled(filter) {

  const cancelledProduct = await orderHistoryModel.findByIdAndUpdate(filter, { isCancelled: true }, { new: true })

  return cancelledProduct
}

// update order
async function updateOrderService(filter, data) {

  const updated = await orderModel.findOneAndUpdate(filter, data, { new: true })
  return updated
}

// update order History
async function updateOrderHistoryService(filter, data) {
  const updatedOrderHistory = await orderHistoryModel.findOneAndUpdate(filter, data, { new: true })

  return updatedOrderHistory
}

export default {
  insertManyOrderHistory,
  lastOrderService,
  createOrderService,
  getAllOrderService,
  getOrderDetailsService,
  deleteOrderHistoryDetailsService,
  markIsCancelled,
  getOrderHistoryService,
  getAllOrderHistoryService,
  updateOrderService,
  updateOrderHistoryService
}