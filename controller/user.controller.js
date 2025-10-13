import 'dotenv/config'
import userModel from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import responseHandler from '../utils/responseHandler.js'
import constants from '../config/constants.js'
import sendMail from '../utils/sendOtpVerificationMail.js'
import userService from '../services/user.service.js'
import otpModel from '../models/otp.model.js'

const register = async (req, res) => {

    try {

        const { name, email, mobile, address, password } = req.body

        // check is Empty
        if (!name || !email || !mobile || !address || !password) return responseHandler(res, constants.BAD_REQUEST, 'failed', 'All fields are required')

        const user = await userModel.findOne({ $or: [{ email }, { mobile }] })

        if (user) return responseHandler(res, constants.BAD_REQUEST, 'failed', 'User is already present with this email')

        const otp = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');

        const newUser = new otpModel({ name, email, mobile, isAdmin: false, address, password, mobile, otp: otp })
        await newUser.save()

        await sendMail(email, otp)
        responseHandler(res, constants.OK, 'success', 'OTP sent to your email')
    } catch (error) {

        responseHandler(res, constants.BAD_REQUEST, 'failed', error.message)
        console.log(error)
    }
}

const login = async (req, res) => {

    try {

        const { field, password } = req.body

        // check is Empty
        if (!field || !password) return responseHandler(res, constants.BAD_REQUEST, 'failed', 'All fields are required')

        // check if user is already present
        const user = await userModel.findOne({
            isAdmin: false,
            $or: [{ email: field }, { mobile: field }]
        }).select(['-otp', '-FCMToken'])


        if (!user) return responseHandler(res, constants.BAD_REQUEST, 'failed', 'User is not present, Please register yourself')

        const status = await bcrypt.compare(password, user.password)
        if (!status) return responseHandler(res, constants.BAD_REQUEST, 'failed', 'Invalid Credentials')

        // check is Verified
        // if (!user.isVerified) {
        //     const otp = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
        //     user.otp = otp
        //     await user.save()

        //     await sendMail(user.email, otp)
        //     return responseHandler(res, constants.OK, 'success', 'OTP sent to your email', { isVerified: user.isVerified })
        // }

        // generate token
        const SECRET_KEY = process.env.SECRET_KEY
        const token = jwt.sign({ userId: user._id.toString(), role: user.isAdmin }, SECRET_KEY)

        responseHandler(res, constants.OK, 'success', 'User logged in', { token, user })

    } catch (error) {

        responseHandler(res, constants.BAD_REQUEST, 'failed', 'Internal Server Error')

        console.log(error)
    }
}


const verifyOTP = async (req, res) => {
    const { email, otp } = req.body

    if (!email || !otp) return responseHandler(res, constants.BAD_REQUEST, 'failed', 'All fields are required')

    // const user = await userService.findUser(email)
    const existingUser = await otpModel.findOne({ email })

    if (!existingUser) {
        return responseHandler(res, constants.BAD_REQUEST, 'failed', 'User is not present with this email')
    }

    console.log(existingUser)
    if (otp !== existingUser.otp) { return responseHandler(res, constants.BAD_REQUEST, 'failed', 'Did`nt matche OTP') }

    const user = new userModel({

        name: existingUser.name,
        email: existingUser.email,
        mobile: existingUser.mobile,
        isAdmin: false,
        address: existingUser.address,
        password: existingUser.password,
        mobile: existingUser.mobile
        // isVerified: true
    })
    await user.save()

    // user.isVerified = true
    // await existingUser.save()

    // generate token
    const SECRET_KEY = process.env.SECRET_KEY
    const token = jwt.sign({ userId: user._id.toString(), role: user.isAdmin }, SECRET_KEY)

    responseHandler(res, constants.OK, 'success', 'User varified', { token, user })
}

export {
    register,
    login,
    verifyOTP
}