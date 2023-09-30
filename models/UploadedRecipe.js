import mongoose from 'mongoose';

const uploadedRecipeSchema = new mongoose.Schema({
    title : {
        type: String,
        require: true
    },
    pdf : {
        type: String,
        require: true
    },
    cloudinaryId : {
        type: String,
        require: true
    },
    tags : {
        type: String,
        require: true
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    
})


const UploadedRecipe = mongoose.model('UploadedRecipe', uploadedRecipeSchema)

export default UploadedRecipe;