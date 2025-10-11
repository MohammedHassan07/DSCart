import userModel from "../models/user.model.js"

async function findUser(email) {

    const user = await userModel.findOne({ email }).select(['-FCMToken', '-password'])

    return user
}

async function findAdmin(filter) {
    const admin = await userModel.findOne(filter)
    return admin
}


export default {
    findUser,
    findAdmin
}