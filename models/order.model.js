import { Schema, model } from "mongoose";

const orderSchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'user'
    },

    products: [{

        type: Schema.Types.ObjectId,
        require: true,
        ref: 'product'
    }],

    totalPrice: Number,

    deliveryCharge: Number,

    netTotal: Number,

    totalQunatity: Number,

    category: [String],

    address: {
        type: String,
        require: true
    }

}, { timestamps: true })

export default model('order', orderSchema)