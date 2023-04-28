const mongoose = require('mongoose')

const newItemSchema = new mongoose.Schema({
    itemInput: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        required: true
    },
    expiry: {
        type: String,
        required: true,
    },
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
    purchaseDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('NewItem', newItemSchema)