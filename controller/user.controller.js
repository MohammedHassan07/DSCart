import 'dotenv/config'
import userModel from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const register = async (req, res) => {

    try {

        const { name, email, mobile, address, password } = req.body

        // check is Empty
        if (!name || !email || !mobile || !address || !password) return res.status(400).json({ status: 'failed', message: 'All fields are required' })

        // check if user is already present
        const user = await userModel.findOne({ email })

        if (user) return res.status(409).json({ status: 'failed', message: 'User is already present with this email' })

        const newUser = new userModel({ name, email, mobile, isAdmin: false, address, password })
        await newUser.save()

        res.status(201).json({ status: 'success', message: 'User Registered successfully' })

    } catch (error) {

        res.status(500).json({ status: 'failed', message: 'Internal Server Error' })
        console.log(error)
    }
}

const login = async (req, res) => {

    try {

        const { field, password } = req.body

        // check is Empty
        if (!field || !password) return res.status(400).json({ status: 'failed', message: 'All fields are required' })

        // check if user is already present
        const user = await userModel.findOne({
            isAdmin: false,
            $or: [{ email: field }, { mobile: field }]
        })


        if (!user) return res.status(404).json({ status: 'failed', message: 'User is not present, Please register yourself' })

        const status = await bcrypt.compare(password, user.password)
        if (!status) return res.status(401).json({ status: 'failed', messae: 'Invalid Credentials' })

        // generate token
        const SECRET_KEY = process.env.SECRET_KEY
        const token = jwt.sign({ userId: user._id.toString(), role: user.isAdmin }, SECRET_KEY)

        res.status(200).json({ status: 'success', message: 'User logged in', token })

    } catch (error) {

        res.status(500).json({ status: 'failed', message: 'Internal Server Error' })
        console.log(error)
    }
}
export { register, login }