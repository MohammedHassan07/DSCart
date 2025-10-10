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
        type: String
    },

    description: String,

    ingredients: String
})

export default model('product', productSchema)