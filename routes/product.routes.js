import express from 'express'
import { addProduct, getAllProducts, getProductByCategory, getProductById, getProductByName } from '../controller/product.controller.js'
import uploadFoodImage from '../middleware/uploadImage.js'
import verfiyToken from '../middleware/verifyToken.js'
import isAdmin from '../middleware/isAdmin.js'

const route = express.Router()

route.post('/add', verfiyToken, uploadFoodImage.single('foodImage'), addProduct)

route.get('/', getAllProducts)

route.get('/category/:category', getProductByCategory)

route.get('/name/:name', getProductByName)

route.get('/id/:id', getProductById)

export default route