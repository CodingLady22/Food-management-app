let mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
    title : {
        type: String,
        require: true
    },
    prep : {
        type: String,
        require: true
    },
    cook : {
        type: String,
        require: true
    },
    total : {
        type: String,
        require: true
    },
    serving : {
        type: String,
        require: true
    },
    // User : {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    // },
    ingredients : {
        type: String,
        require: true
    },
    instructions : {
        type: String,
        require: true
    },
})

module.exports = mongoose.model('Recipe', recipeSchema)