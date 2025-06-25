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

    rate: Number,

    deliveryCharge: Number,

    address: {
        type: String,
        require: true
    }

}, { timestamps: true })

export default model('order', orderSchema)