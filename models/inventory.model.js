import { Schema, model } from "mongoose";
import inventoryHistoryModel from "./inventoryHistory.model.js";

const inventorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    userName: String,
    userEmail: String,
    inventoryType: {
        type: String,
        enum: ['add', 'deduct'],
        required: true
    },
    products: [{ type: Schema.Types.ObjectId, ref: 'product', required: true }],
    totalPrice: Number,
    netTotal: Number,
    totalQuantity: Number,
    inventoryNumber: {
        type: String,
    }
}, { timestamps: true });

export default model("inventory", inventorySchema);
