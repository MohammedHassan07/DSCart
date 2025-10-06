import express from 'express'
import { addProduct, getAllProducts, getProductById } from '../controller/product.controller.js'
import uploadFoodImage from '../middleware/uploadImage.js'
import verfiyToken from '../middleware/verifyToken.js'
import isAdmin from '../middleware/isAdmin.js'

const route = express.Router()

route.post('/add-product', verfiyToken, isAdmin, addProduct)

route.post('/get-products', getAllProducts)

route.get('/id/:id', getProductById)

// route.get('/category/:category', getProductByCategory)

// route.get('/name/:name', getProductByName)


export default route