import jwt from 'jsonwebtoken'
import 'dotenv/config'
import adminModel from '../models/admin.model.js'
import bcrypt from 'bcryptjs'
import userModel from '../models/user.model.js'
import responseHandler from '../utils/responseHandler.js'
import constants from '../config/constants.js'

const register = async (req, res) => {

    try {

        const { name, email, password, address, mobile } = req.body

        // check is Empty
        if (!name || !email || !password || !address || !mobile) return responseHandler(res, constants.BAD_REQUEST, 'failed', 'All fields are required')

            console.log(req.body)
        // check if user is already present
        const user = await userModel.findOne({ $or: [{ email }, { mobile }] })

        // console.log(user)
        if (user) return responseHandler(res, constants.BAD_REQUEST, 'failed', 'User is already registered')

        const newUser = new userModel({ name, email, password, isAdmin: true, address, mobile })
        await newUser.save()

        return responseHandler(res, constants.OK, 'success', 'User Registered successfully', { email, name, mobile })

    } catch (error) {
        responseHandler(res, constants.BAD_REQUEST, 'failed', error.message)
        console.log(error)
    }
}

const login = async (req, res) => {

    try {

        const { email, password } = req.body

        // check is Empty
        if (!email || !password) return res.status(400).json({ status: 'failed', message: 'All fields are required' })

        // check if user is already present
        const user = await userModel.findOne({ email, isAdmin: true })

        if (!user) return responseHandler(res, constants.BAD_REQUEST, 'failed', 'User is not present, Please register yourself')

        const status = await bcrypt.compare(password, user.password)

        if (!status) return responseHandler(res, constants.BAD_REQUEST, 'failed', 'Invalid Credetials')


        // generate token
        const SECRET_KEY = process.env.SECRET_KEY
        const token = jwt.sign({ userId: user._id.toString(), role: user.isAdmin }, SECRET_KEY)

        responseHandler(res, constants.OK, 'success', 'User logged in', token)
    } catch (error) {

        responseHandler(res, constants.BAD_REQUEST, 'failed', error.message)
        console.log(error)
    }
}
export { register, login }