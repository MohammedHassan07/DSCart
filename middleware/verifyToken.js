import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";


const verfiyToken = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(' ')[1]
        const SECRET_KEY = process.env.SECRET_KEY

        const decoded = jwt.verify(token, SECRET_KEY)

        req.userId = decoded.userId

        const user = await userModel.findOne({ _id: decoded.userId, isAdmin: true })

        if (!user) return res.status(401).json({flag: false, message: 'Unauthorized'})
        next()

    } catch (error) {
        console.log(error)
    }
}

export default verfiyToken
