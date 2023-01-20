const Comment = require("../models/Comment")

module.exports = {
    getComments: async (req, res) => {
        try {
            const comments = await Comment.find()
            res.render('comments.ejs', {getComments: comments})
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    },
    createComment: async (req, res) => {
        const newComment = new Comment(
            {
                title: req.body.title,
                comment: req.body.comment
            }
        )
        try {
            await newComment.save()
            console.log(newComment)
            res.redirect('/comment')
        } catch (err) {
            if (err) return res.status(500).send(err)
            res.redirect('/')
        }
    },
    updateComment: async (req, res) => {
        // const id = req.params.id
        // try {
        //     await Comment.findByIdAndUpdate(id)
        // } catch (error) {
            
        // }
    },
    deleteComment: async (req, res) => {

    }
}