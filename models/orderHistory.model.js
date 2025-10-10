import { Schema, model } from "mongoose";

const orderHistorySchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'user'
    },
    orderId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'order'
    },
    productId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'product'
    },
    userName: {
        type: String
    },
    userEmail: {
        type: String
    },

    productName: {
        type: String
    },
    productCategory: {
        type: String
    },
    productPrice: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    productQuantity: {
        type: Number,
        default: 0
    },

    orderNumber: {
        type: String
    },
}, { timestamps: true })

export default model('orderHistory', orderHistorySchema)