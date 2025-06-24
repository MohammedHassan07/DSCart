import { Schema, model } from "mongoose";

const orderSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        require: true
    },

    products: [{

        type: Schema.Types.ObjectId,
        require: true
    }],

    quantity: Number,

    Rate: Number,

    deliveryCharge: String,

    address: {
        type: String,
        require: true
    }

}, { timestamps: true })

export default model('user', orderSchema)