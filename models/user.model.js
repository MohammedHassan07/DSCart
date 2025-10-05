import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new Schema({

    isAdmin: {
        type: Boolean,
        require: true,
        default: false
    },

    name: {
        type: String,
    },

    password: {
        type: String,
    },

    email: {

        type: String,
        required: true,
        unique: true
    },

    mobile: {

        type: String,
        unique: true,
        required: true,
    },

    address: {
        type: String,
        required: true
    }
})

userSchema.pre("save", async function (next) {

    try {

        if (this.isModified("password")) {

            this.password = await bcrypt.hash(this.password, 10)
        }

        next()
    } catch (err) {
        console.log(err)
    }
})

export default model('user', userSchema)