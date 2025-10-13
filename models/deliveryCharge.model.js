import { Schema, model } from "mongoose";

const deliveryChargeSchema = new Schema({

    amount: {
        type: Number,
        default: 0
    },

}, { timestamps: true })




export default model('deliverycharge', deliveryChargeSchema)