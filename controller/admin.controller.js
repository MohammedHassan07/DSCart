import jwt from 'jsonwebtoken'
import 'dotenv/config'
import adminModel from '../models/admin.model.js'
import bcrypt from 'bcryptjs'

const register = async (req, res) => {

    try {

        const { name, email, password } = req.body

        // check is Empty
        if (!name || !email || !password) return res.status(400).json({ flag: false, message: 'All fields are required' })

        // check if user is already present
        const user = await adminModel.findOne({ email })

        // console.log(user)
        if (user) return res.status(409).json({ flag: false, message: 'User is already present with this email' })

        const newUser = new adminModel({ name, email, password })
        await newUser.save()

        res.status(201).json({ flag: true, message: 'User Registered successfully' })

    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}

const login = async (req, res) => {

    try {

        const { email, password } = req.body

        // check is Empty
        if (!email || !password) return res.status(400).json({ flag: false, message: 'All fields are required' })

        // check if user is already present
        const user = await adminModel.findOne({ email })

        if (!user) return res.status(404).json({ flag: false, message: 'User is not present, Please register yourself' })

        const flag = await bcrypt.compare(password, user.password)

        if (!flag) return res.status(401).json({ flag: false, messae: 'Invalid Credentials' })

        // generate token
        const SECRET_KEY = process.env.SECRET_KEY
        const token = jwt.sign({ userId: user._id.toString() }, SECRET_KEY)

        res.status(200).json({ flag: true, message: 'User logged in', token })

    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}
export { register, login }