const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.CONNECTION_STRING_DB)
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}
module.exports = connectDB