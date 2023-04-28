let mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    title : {
        type: String,
        require: true
    },
    comment : {
        type: String,
        require: true
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
})

module.exports = mongoose.model('Comment', commentSchema)