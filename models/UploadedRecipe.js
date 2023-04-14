let mongoose = require('mongoose')

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
    // User : {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    // },
    
})

module.exports = mongoose.model('UploadedRecipe', uploadedRecipeSchema)