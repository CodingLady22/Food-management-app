import mongoose from 'mongoose';

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


const Comment = mongoose.model('Comment', commentSchema)

export default Comment;