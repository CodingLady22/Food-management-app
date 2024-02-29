import Comment from '../models/Comment.js';


// * Display user comments
    export const getComments = async (req, res) => {
        try {
            const comments = await Comment.find({ user: req.user.id })
            
            res.render('comments.ejs', { enteredComments: comments, user: req.user })
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }
    
    // * Create new comments
    export const createComment = async (req, res) => {
        const newComment = new Comment(
            {
                title: req.body.title,
                comment: req.body.comment,
                user: req.user.id,
            }
        )
        try {
            await newComment.save()

            res.redirect('/comments')
        } catch (err) {
            if (err) return res.status(500).send(err)
            res.redirect('/dash')
        }
    }

    // * Retrieves and renders an individual user comment or note in full.
    export const getOneComment = async (req, res) => {
        try {
            const comments = await Comment.findById(req.params.id)
            
            res.render('viewComment.ejs', { oneComment: comments, user: req.user })
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }

    //* Display edit page
    export const editComments = async (req, res) => {
        const id = req.params.id
        try {
            const comments = await Comment.find()
            res.render('editComment.ejs', { editComment : comments, commentId : id})
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }

    // * Update comments
    export const updateComment = async (req, res) => {
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
    }
    
    // * Delete comment
    export const deleteComment = async (req, res) => {
        const id = req.params.id
        try {
            const comment = await Comment.findByIdAndDelete(id)
            console.log(`${comment} has been deleted`);
            res.redirect('/comments')
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }