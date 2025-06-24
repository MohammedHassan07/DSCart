import { Schema, model } from "mongoose";

const productSchema = new Schema({

    name: {
        type: String,
    },

    category: {

        type: String,
        require: true,
    },

    price: {

        type: Number,
    },
    
    imageURL: {
        type: String,
        unique: true
    }
})

export default model('product', productSchema)