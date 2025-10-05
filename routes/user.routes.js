import express from 'express'
import { login, register, verifyOTP } from '../controller/user.controller.js'

const route = express.Router()

route.post('/register', register)

route.post('/login', login)

route.post('/verify-otp', verifyOTP)

export default route