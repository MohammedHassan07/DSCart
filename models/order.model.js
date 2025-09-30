import { Schema, model } from "mongoose";
import orderHistoryModel from "./orderHistory.model.js";


const orderSchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'user'
    },

    products: [orderHistoryModel.schema],

    totalPrice: Number,

    deliveryCharge: Number,

    netTotal: Number,

    totalQuantity: Number,

    address: {
        type: String,
        require: true
    },

    orderNumber: {
        type: String,
        default: 'OR1'
    }

}, { timestamps: true })

export default model('order', orderSchema)