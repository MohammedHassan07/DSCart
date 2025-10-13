import express from 'express'
import verfiyToken from '../middleware/verifyToken.js'
import deliveryChargeController from '../controller/deliveryCharge.controller.js'
import isAdmin from '../middleware/isAdmin.js'

const router = express.Router()

router.use(verfiyToken)
router.use(isAdmin)

router.post('/', deliveryChargeController.createDeliveryCharge)

router.get('/', deliveryChargeController.getDeliveryCharge)

router.put('/:id', deliveryChargeController.updateDeliveryCharge)

router.delete('/:id', deliveryChargeController.deleteDeliveryCharge)

export default router