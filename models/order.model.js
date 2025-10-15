import { Schema, model } from "mongoose";

const orderSchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'user'
    },
    userName: {
        type: String
    },
    userEmail: {
        type: String
    },

    products: [{type: Schema.Types.ObjectId, requried: true, ref: 'product'}],

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
    },
    
    isCancelled: {
        type: Boolean,
        default: false
    }


}, { timestamps: true })

export default model('order', orderSchema)