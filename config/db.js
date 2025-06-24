import mongoose from 'mongoose'

export default async function connectDataBase() {

    const DB_URI = process.env.DB_URI

    const connection = await mongoose.connect(DB_URI)

    if (connection) {

        console.log('Database connected')
    }
}