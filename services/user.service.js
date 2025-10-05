import userModel from "../models/user.model.js"

async function findUser(email) {

    const user = await userModel.findOne({email})

    return user
}


export default {
    findUser
}