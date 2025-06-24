import userModel from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const register = async (req, res) => {

    try {

        const { name, email, mobile } = req.body

        // check is Empty
        if (!name || !email || !mobile) return res.status(402).json({ flag: false, message: 'All fields are required' })

        // check if user is already present
        const user = await userModel.findOne({ email })

        // console.log(user)
        if (user) return res.status(402).json({ flag: false, message: 'User is already present with this email' })

        const newUser = new userModel({ name, email, mobile })
        await newUser.save()

        res.status(201).json({ flag: true, message: 'User Registered successfully' })

    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}

const login = async (req, res) => {

    try {

        const { email, mobile } = req.body

        // check is Empty
        if (!email || !mobile) return res.status(402).json({ flag: false, message: 'All fields are required' })

        // check if user is already present
        const user = await userModel.findOne({
            $or: [{ email }, { mobile }]
        })

        if (!user) return res.status(402).json({ flag: false, message: 'User is not present, Please register yourself' })

        // generate token
        const SECRET_KEY = process.env.SECRET_KEY
        const token = jwt.sign({ user: user._id }, SECRET_KEY)

        res.status(200).json({ flag: true, message: 'User logged in', token })

    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}
export { register, login }