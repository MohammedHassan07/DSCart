import { Types } from "mongoose"
import inventoryService from "../services/inventory.service.js"
import responseHandler from "../utils/responseHandler.js"
import constants from '../config/constants.js'
import orderService from '../services/order.service.js'

const addInventory = async (req, res) => {
    try {
        const { products, totalPrice, netTotal, userName, userEmail, totalQuantity, inventoryType, orderId } = req.body
        const userId = req.userId

        if (!products || products.length < 1 || !totalPrice || !netTotal || !totalQuantity || !inventoryType || !orderId) {
            return responseHandler(res, constants.BAD_REQUEST, 'failed', 'All fields are required')
        }

        // Generate next inventory number and find order
        const [lastInventory, order] = await Promise.all([
            inventoryService.lastInventoryService(),
            orderService.getOrderDetailsService({
                _id: new Types.ObjectId(orderId),
                userId: new Types.ObjectId(userId)
            })
        ])

        if (!order) {
            return responseHandler(res, constants.BAD_REQUEST, 'failed', 'Order not found')
        }

        // if qunatity is 0 
        if (inventoryType === "deduct") {
            for (let p of products) {
                const orderHist = await orderService.getOrderHistoryService({
                    orderId: order._id,
                    productId: p.productId,
                    userId,
                });

                if (!orderHist) {
                    return responseHandler(res, constants.BAD_REQUEST, "failed", `Product ${p.productName} not found in order`);
                }

                if (orderHist.productQuantity <= 0) {
                    return responseHandler(
                        res,
                        constants.BAD_REQUEST,
                        "failed",
                        `Product ${p.productName} has zero quantity, cannot deduct`
                    );
                }

                if (orderHist.productQuantity - p.productQuantity < 0) {
                    return responseHandler(
                        res,
                        constants.BAD_REQUEST,
                        "failed",
                        `Cannot deduct ${p.productQuantity} of ${p.productName}. Only ${orderHist.productQuantity} available`
                    );
                }
            }
        }

        let nextNumber = 1
        const codePrefix = "INV"
        if (lastInventory && lastInventory.inventoryNumber) {
            const lastNum = parseInt(lastInventory.inventoryNumber.replace(codePrefix, ''), 10)
            nextNumber = lastNum + 1
        }

        const newInventory = {
            userId,
            userName,
            userEmail,
            totalPrice,
            netTotal,
            totalQuantity,
            inventoryType,
            inventoryNumber: codePrefix + String(nextNumber).padStart(6, "0")
        }

        // Create inventory entry
        const savedInventory = await inventoryService.addInventoryService(newInventory)

        // Create histories
        const newHistoryEntries = products.map(p => ({
            userId: new Types.ObjectId(userId),
            productName: p.productName,
            productCategory: p.productCategory,
            productPrice: p.productPrice,
            totalPrice: p.totalPrice,
            productQuantity: p.productQuantity,
            inventoryNumber: codePrefix + String(nextNumber).padStart(6, "0"),
            inventoryId: new Types.ObjectId(savedInventory._id),
            productId: new Types.ObjectId(p.productId),
            inventoryType: inventoryType
        }))

        const savedHistory = await inventoryService.addInventoryHistoryService(newHistoryEntries)

        // Embed histories in parent inventory
        savedInventory.products = savedHistory.map(h => h._id)

        // Update OrderHistory for each product
        for (let p of products) {
            const orderHist = await orderService.getOrderHistoryService({
                orderId: order._id,
                productId: p.productId,
                userId
            })

            if (orderHist) {

                if (inventoryType === 'add') {
                    orderHist.productQuantity += p.productQuantity
                } else if (inventoryType === 'deduct') {
                    orderHist.productQuantity -= p.productQuantity
                }

                orderHist.totalPrice = orderHist.productPrice * orderHist.productQuantity

                // If quantity becomes 0, mark isCancelled true
                if (orderHist.productQuantity <= 0) {
                    orderHist.productQuantity = 0
                    orderHist.totalPrice = 0
                    orderHist.isCancelled = true
                }

                await orderHist.save()
            }
        }

        // Update Order totals based on updated orderHistory
        const allHistories = await orderService.getAllOrderHistoryService({ orderId: order._id })
        const updatedTotalPrice = allHistories.reduce((sum, item) => sum + item.totalPrice, 0)
        const updatedTotalQuantity = allHistories.reduce((sum, item) => sum + item.productQuantity, 0)

        order.totalPrice = Number(updatedTotalPrice)
        order.totalQuantity = Number(updatedTotalQuantity)
        order.netTotal = Number(updatedTotalPrice + (order.deliveryCharge || 0))


        await Promise.all([
            savedInventory.save(),
            order.save()
        ])

        // send FCM
        const title = 'Order updated'
        const body = `Order has been updated by ${userName}.`

        const filter = {
            isAdmin: true
        }
        const admin = await userService.findAdmin(filter)
        // await sendFCM(admin.FCMToken, title, body)

        return responseHandler(res, constants.CREATED, 'success', 'Order updated', savedInventory)
  
    } catch (error) {
        console.log(error)
        return responseHandler(res, constants.BAD_REQUEST, 'failed', error.message)
    }
}

export default {
    addInventory
}