import userModel from "../models/user.model.js";

const isAdmin = async (req, res, next) => {

    if (!req.role)
        return res.status(401).json({ status: 'failed', message: 'Unauthorized' })

    next()
}

export default isAdmin