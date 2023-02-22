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
            res.redirect('/comments')
        } catch (err) {
            if (err) return res.status(500).send(err)
            res.redirect('/')
        }
    },
    // getting to the edit page
    editComments: async (req, res) => {
        const id = req.params.id
        console.log(id);
        try {
            const comments = await Comment.find()
            res.render('editComment.ejs', { editComment : comments, commentId : id})
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    },
    // doing the actual edit
    updateComment: async (req, res) => {
        const id = req.params.id
        try {
            await Comment.findByIdAndUpdate(id, {
                title: req.body.title,
                comment: req.body.comment
            })
            res.redirect('/comments')
        } catch (err) {
            if (err) return res.status(500).send(err)
            res.redirect('/comments')
        }
    },
    deleteComment: async (req, res) => {
        const id = req.params.id
        try {
            const comment = await Comment.findByIdAndDelete(id)
            console.log(comment);
            res.redirect('/comments')
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }
}