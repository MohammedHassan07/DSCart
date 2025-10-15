import express from 'express'
import verfiyToken from '../middleware/verifyToken.js'
import inventoryController from '../controller/inventory.controller.js'

const route = express.Router()

route.use(verfiyToken)

route.post('/add-inventory', inventoryController.addInventory)

export default route