import mongoose from 'mongoose'

export default async function connectDataBase() {

    const DB_URL = process.env.DB_URL
    
    const connection = await mongoose.connect(DB_URL)

    if (connection) {

        console.log('Database connected')
    }
}