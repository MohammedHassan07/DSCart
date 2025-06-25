import { Schema, model } from "mongoose"
import bcrypt from "bcryptjs"

const adminSchema = new Schema({


    name: {
        type: String,
    },

    password: {
        type: String,
        require: true,
    },

    email: {

        type: String,
        require: true,
        unique: true
    }
})

adminSchema.pre("save", async function (next) {
    
    try {

        if (this.isModified("password")) {

            this.password = await bcrypt.hash(this.password, 10)
        }

        next()
    } catch (err) {
        console.log(error)
    }
})

export default model('admin', adminSchema)