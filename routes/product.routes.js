import express from 'express'
import { addProduct } from '../controller/product.controller.js'
import uploadFoodImage from '../middleware/uploadImage.js'

const route = express.Router()

route.post('/add', uploadFoodImage.single('foodImage'), addProduct)

export default route