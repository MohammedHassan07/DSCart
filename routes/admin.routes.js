import express from 'express'
import { login, register, saveFCMToken } from '../controller/admin.controller.js'
import verfiyToken from '../middleware/verifyToken.js'
import isAdmin from '../middleware/isAdmin.js'

const route = express.Router()

route.post('/register', register)

route.post('/login', login)

route.post('/save-token', verfiyToken, isAdmin, saveFCMToken)

export default route