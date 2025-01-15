import mongoose from 'mongoose';

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
    purchaseDate: {
        type: String,
        required: false,
    },
    user: {
    type: mongoose.Schema.Types.Mixed,  // Changed to Mixed to handle both ObjectId and string
    ref: "User",
  },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const NewItem = mongoose.model('NewItem', newItemSchema)

export default NewItem;