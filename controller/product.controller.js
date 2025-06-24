import productModel from '../models/product.model.js'

// Add Product --> Protected only for admin
const addProduct = async (req, res) => {

    try {

        const fileName = req.file.filename

        const { name, price, category, description, ingredients } = req.body

        // check if the file is sent from the user or not
        if (!req.file) return res.status(404).json({ flag: false, message: 'Image is required' })

        // check empty values
        if (!name || !price || !category) return res.status(402).json({ flag: false, message: 'All fields are required' })

        // change the image URL with any CDN
        const newProduct = new productModel({

            name, price, category,
            imageURL: req.file.path,
            description,
            ingredients
        })

        await newProduct.save()
        res.status(200).json({ flag: true, message: 'Product Added Successfully' })


    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}


// get all Product --> for every users
const getAllProducts = async (req, res) => {

    try {

        const products = await productModel.find().select(['-ingredients', '-description'])

        if (products.length < 1) return res.status(404).json({ flag: false, message: 'No products found' })

        res.status(200).json({ flag: true, products, message: 'Product found' })

    } catch (error) {
        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}

const getProductByCategory = async (req, res) => {
    try {

        const category = req.params.category

        const products = await productModel.find({ category: category }).select(['-ingredients', '-description'])

        if (products.length < 1) return res.status(404).json({ flag: false, message: 'No products found' })

        res.status(200).json({ flag: true, products, message: 'Product found' })

    } catch (error) {
        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}

const getProductByName = async (req, res) => {
    try {

        const productName = req.params.name

        const products = await productModel.find({ name: productName }).select(['-ingredients', '-description'])

        if (products.length < 1) return res.status(404).json({ flag: false, message: 'No products found' })

        res.status(200).json({ flag: true, products, message: 'Product found' })

    } catch (error) {
        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}


const getProductById = async (req, res) => {
    try {

        const productId = req.params.id

        const products = await productModel.find({ _id: productId })

        if (products.length < 1) return res.status(404).json({ flag: false, message: 'No products found' })

        res.status(200).json({ flag: true, products, message: 'Product found' })

    } catch (error) {
        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}


export {
    addProduct,
    getAllProducts,
    getProductByCategory,
    getProductByName,
    getProductById
}