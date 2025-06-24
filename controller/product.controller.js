import productModel from '../models/product.model.js'

const addProduct = async (req, res) => {

    try {

        const fileName = req.file.filename

        const { name, price, category } = req.body

        console.log(req.file.path)

        // check if the file is sent from the user or not
        if (!req.file) return res.status(404).json({ flag: false, message: 'Image is required' })

        // check empty values
        if (!name || !price || !category) return res.status(402).json({ flag: false, message: 'All fields are required' })

        // change the image URL with any CDN
        const newProduct = new productModel({

            name, price, category,
            imageURL: req.file.path
        })

        await newProduct.save()
        res.status(200).json({ flag: true, message: 'Product Added Successfully' })


    } catch (error) {

        res.status(500).json({ flag: false, message: 'Internal Server Error' })
        console.log(error)
    }
}

export {
    addProduct
}