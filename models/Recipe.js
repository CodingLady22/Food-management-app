let mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
    title : {
        type: String,
        require: true
    },
    image: {
    type: String,
    require: true,
    },
    cloudinaryId: {
    type: String,
    require: true,
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
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    ingredients : {
        type: String,
        require: true
    },
    instructions : {
        type: String,
        require: true
    },
    note : {
        type: String
    },
    hashtags : {
        type: [String],
        validate: {
            validator: function (hashtags) {
                return hashtags.length <= 15;
            },
            message: 'Maximum of 15 hashtags allowed per recipe.'
        }
    },
    createdAt: {
    type: Date,
    default: Date.now,
    },
})

module.exports = mongoose.model('Recipe', recipeSchema)