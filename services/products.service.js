import productModel from '../models/product.model.js'
import { Types } from 'mongoose';
async function getAllProductsService(filter, page, limit) {

    const skip = (page - 1) * limit;
    const result = await productModel.aggregate([
        { $match: filter }, // apply filter

        {
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ]);

    // result looks like: [{ data: [...], totalCount: [{ count: 50 }] }]
    const products = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    return { products, total };
}

// get product by Id
async function getProductByIdService(id) {

    const product = await productModel.find({ _id: new Types.ObjectId(id) })

    return product
}

export default {
    getAllProductsService,
    getProductByIdService,
}