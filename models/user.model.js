import { Schema, model } from "mongoose";

const userSchema = new Schema({

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
    }
})

export default model('user', userSchema)