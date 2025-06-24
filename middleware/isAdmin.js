import userModel from "../models/user.model.js";

const isAdmin = async (req, res, next) => {

    const user = await userModel.findOne({ _id: req.userId, isAdmin: true })

    if (!user) return res.status(401).json({ flag: false, message: 'Unauthorized' })

    next()
}

export default isAdmin