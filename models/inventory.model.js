import { Schema, model } from "mongoose";
import orderHistoryModel from "./orderHistory.model.js";


const inventorySchema = new Schema({

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

    products: [orderHistoryModel.schema],

    totalPrice: Number,

    // deliveryCharge: Number,

    netTotal: Number,

    totalQuantity: Number,

    // address: {
    //     type: String,
    //     require: true
    // },

    inventoryNumber: {
        type: String,
        default: 'INV1'
    },

    inventoryType: {
        type: String,
        enum: ['add', 'deduct'],
        required: true
    }

}, { timestamps: true })

export default model('inventory', inventorySchema)