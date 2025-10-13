import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs"

const otpSchema = new Schema({

    email: {

        type: String,
        required: true,
        unique: true
    },
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

    mobile: {

        type: String,
        unique: true,
        required: true,
    },
    address: {
        type: String,
        required: true
    },

    otp: {
        type: String,
        default: ""
    },
    ttl: { type: Date, default: Date.now, expires: 60 }
    
}, { timestamps: true })

otpSchema.pre("save", async function (next) {

    try {

        if (this.isModified("password")) {

            this.password = await bcrypt.hash(this.password, 10)
        }

        next()
    } catch (err) {
        console.log(err)
    }
})


export default model('otp', otpSchema)