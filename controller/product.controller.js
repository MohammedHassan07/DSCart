import constants from '../config/constants.js'
import productModel from '../models/product.model.js'
import productsService from '../services/products.service.js'
import { Types } from 'mongoose';
import responseHandler from '../utils/responseHandler.js';

// Add Product --> Protected only for admin
const addProduct = async (req, res) => {

    try {

        // const fileName = req.file.filename

        const { name, price, category, description, ingredients, imageURL } = req.body

        // check if the file is sent from the user or not
        // if (!req.file) return responseHandler(res, constants.BAD_REQUEST, 'failed', 'Image is required')

        // check empty values
        if (!name || !price || !category || !imageURL || !description) return responseHandler(res, constants.BAD_REQUEST, 'failed', 'All fields are required')

        // change the image URL with any CDN
        const newProduct = new productModel({

            name, price, category,
            imageURL: imageURL,
            description,
            ingredients
        })

        const prod = await newProduct.save()
        responseHandler(res, constants.CREATED, 'success', 'Product Added Successfully', { product: prod })
    } catch (error) {

        responseHandler(res, constants.BAD_REQUEST, 'failed', error.message)
        console.log(error)
    }
}


// get all Product --> for every users
const getAllProducts = async (req, res) => {
    try {

        let { page = 1, limit = 10, search } = req.body;

        let filter = {}
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { price: { $regex: search, $options: "i" } },
            ];
        }

        page = parseInt(page);
        limit = parseInt(limit);

        const { products, total } = await productsService.getAllProductsService(filter, page, limit)

        if (products.length < 1) {

            return responseHandler(res, constants.OK, 'failed', 'No products found')
        }

        responseHandler(res, constants.OK, 'success', 'Products found', products)
    } catch (error) {

        responseHandler(res, constants.BAD_REQUEST, 'failed', error.message)
        console.log(error)
    }
};


// const getProductByCategory = async (req, res) => {
//     try {

//         const category = req.params.category

//         const products = await productModel.find({ category: category }).select(['-ingredients', '-description'])

//         if (products.length < 1) return res.status(404).json({ flag: false, message: 'No products found' })

//         res.status(200).json({ flag: true, products, message: 'Product found' })

//     } catch (error) {
//         res.status(500).json({ flag: false, message: 'Internal Server Error' })
//         console.log(error)
//     }
// }

// const getProductByName = async (req, res) => {
//     try {

//         const productName = req.params.name

//         const products = await productModel.find({ name: productName }).select(['-ingredients', '-description'])

//         if (products.length < 1) return res.status(404).json({ flag: false, message: 'No products found' })

//         res.status(200).json({ flag: true, products, message: 'Product found' })

//     } catch (error) {
//         res.status(500).json({ flag: false, message: 'Internal Server Error' })
//         console.log(error)
//     }
// }

const getProductById = async (req, res) => {
    try {

        const productId = req.params.id

        if (!Types.ObjectId.isValid(productId)) {
            return responseHandler(res, constants.BAD_REQUEST, 'failed', 'Invalid Product ID')
        }

        const product = await productsService.getProductByIdService(productId)

        if (!product) return responseHandler(res, constants.BAD_REQUEST, 'failed', 'No products found')

        responseHandler(res, constants.OK, 'success', 'Product found', product)

    } catch (error) {
        responseHandler(res, constants.SERVER_ERROR, 'failed', 'Internal Server Error')
        console.log(error)
    }
}


export {
    addProduct,
    getAllProducts,
    // getProductByCategory,
    // getProductByName,
    getProductById
}