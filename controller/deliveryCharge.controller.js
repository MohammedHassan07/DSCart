import deliveryChargeModel from "../models/deliveryCharge.model.js";
import responseHandler from "../utils/responseHandler.js";
import constants from "../config/constants.js";

const createDeliveryCharge = async (req, res) => {
    try {
        const { amount } = req.body;

        // Validation
        if (amount === undefined || amount === null || isNaN(amount)) {
            return responseHandler(res, constants.BAD_REQUEST, 'failed', 'All fields are required');
        }

        const deliveryCharge = new deliveryChargeModel({ amount });
        const saved = await deliveryCharge.save();

        responseHandler(res, constants.CREATED, 'success', 'Delivery amount added', saved);
    } catch (error) {
        responseHandler(res, constants.SERVER_ERROR, 'failed', error.message);
    }
}

const getDeliveryCharge = async (req, res) => {
    try {
        const charges = await deliveryChargeModel.find();
        responseHandler(res, constants.OK, 'success', 'delivery amount fetched', charges);
    } catch (error) {
        responseHandler(res, constants.SERVER_ERROR, 'failed', error.message);
    }
}

const updateDeliveryCharge = async (req, res) => {
    try {
        const { amount } = req.body;

        // Validation
        if (amount === undefined || amount === null || isNaN(amount)) {
            return responseHandler(res, constants.BAD_REQUEST, 'failed', 'All fields are required');
        }

        const updated = await deliveryChargeModel.findByIdAndUpdate(
            req.params.id,
            { amount },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return responseHandler(res, constants.NOT_FOUND, 'failed', 'Not found');
        }

        responseHandler(res, constants.OK, 'success', 'amount updated', updated);
    } catch (error) {
        responseHandler(res, constants.SERVER_ERROR, 'failed', error.message);
    }
}

const deleteDeliveryCharge = async (req, res) => {
    try {
        const deleted = await deliveryChargeModel.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return responseHandler(res, constants.NOT_FOUND, 'failed', 'Not found');
        }

        responseHandler(res, constants.OK, 'success', 'Deleted successfully');
    } catch (error) {
        responseHandler(res, constants.SERVER_ERROR, 'failed', error.message);
    }
}
export default {
    createDeliveryCharge,
    getDeliveryCharge,
    updateDeliveryCharge,
    deleteDeliveryCharge
}