import { Schema, model } from "mongoose";

const userSchema = new Schema({

    isAdmin: {
        type: Boolean,
        require: true,
        default: false
    },

    name: {
        type: String,
    },

    email: {

        type: String,
        require: true,
        unique: true
    },

    mobile: {

        type: String,
        unique: true
    },

    address: {
        type: String,
        required: true
    }
})

export default model('user', userSchema)