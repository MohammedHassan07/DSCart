import { Schema, model } from "mongoose";

const inventoryHistorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    inventoryId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'inventory'
    },
    productId: { type: Schema.Types.ObjectId, ref: 'product', required: true },
    productName: String,
    productCategory: String,
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
    inventoryNumber: {
        type: String
    },
    inventoryType: {
        type: String,
        enum: ['add', 'deduct']
    }

}, { timestamps: true });

export default model("inventoryHistory", inventoryHistorySchema);
