import Comment from '../models/Comment.js';


    export const getComments = async (req, res) => {
        try {
            console.log(req.user.id);
            // Retrieve user's comments and notes 
            const comments = await Comment.find({ user: req.user.id })
            // Render the comments view with data
            res.render('comments.ejs', { enteredComments: comments, user: req.user })
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }
    
    export const createComment = async (req, res) => {
        // Creates a new user comment or note containing the comment's title and content and saves it to the database.
        const newComment = new Comment(
            {
                title: req.body.title,
                comment: req.body.comment,
                user: req.user.id,
            }
        )
        try {
            // Save the newly created user comment or note to the database
            await newComment.save()
            // console.log(newComment)
             // Redirect to the comments and notes page after successful creation
            res.redirect('/comments')
        } catch (err) {
            // Handle errors and send an appropriate response
            if (err) return res.status(500).send(err)
            // Redirect to an error page or dashboard in case of an error
            res.redirect('/dash')
        }
    }

    // Retrieves and renders an individual user comment or note in full detail.
    // This function is used to view the complete content of a specific entry.
    export const getOneComment = async (req, res) => {
        try {
            console.log(req.user.id);
            // Retrieve a single user comment or note by its unique identifier
            const comments = await Comment.findById(req.params.id)
             // Render the viewComment view to display the full content of the entry
            res.render('viewComment.ejs', { oneComment: comments, user: req.user })
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }
    // Function to get edit page
    export const editComments = async (req, res) => {
        const id = req.params.id
        console.log(id);
        try {
            const comments = await Comment.find()
            // Render the editComment view with data
            res.render('editComment.ejs', { editComment : comments, commentId : id})
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }
    // Function to update notes in comments
    export const updateComment = async (req, res) => {
        const id = req.params.id
        try {
            // Updates the user's individual comment or note based on its unique identifier.
            await Comment.findByIdAndUpdate(id, {
                title: req.body.title,
                comment: req.body.comment
            })
            // Redirect to the comments and notes page after updating
            res.redirect('/comments')
        } catch (err) {
            // Handle errors and send an appropriate response
            if (err) return res.status(500).send(err)
            res.redirect('/comments')
        }
    }
    
    export const deleteComment = async (req, res) => {
        const id = req.params.id
        try {
            // Delete the user's individual comment or note based on its unique identifier.
            const comment = await Comment.findByIdAndDelete(id)
            console.log(comment);
            // Redirect to the comments and notes page after deletion
            res.redirect('/comments')
        } catch (err) {
            // Handle errors and send an appropriate response
            if (err) return res.status(500).send(err)
        }
    }