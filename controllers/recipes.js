const Recipe = require("../models/Recipe")

module.exports = {
    getRecipes: async (req, res) => {
        try {
            const recipes = await Recipe.find()
            res.render('recipes.ejs', {getRecipes: recipes})
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    },
    addRecipe: async (req, res) => {
        // const newComment = new Comment(
            // {
            //     title: req.body.title,
            //     comment: req.body.comment
            // }
        // )
        // try {
            // await newComment.save()
            // console.log(newComment)
            // res.redirect('/comments')
        // } catch (err) {
            // if (err) return res.status(500).send(err)
            // res.redirect('/')
        // }
    },
    createRecipe: async (req, res) => {
       const newRecipe = new Recipe(
            {
                title: req.body.title,
                prep: req.body.prep,
                cook: req.body.cook,
                total: req.body.total,
                serving: req.body.serving,
                ingredients: req.body.ingredients,
                instructions: req.body.instructions,
            }
        )
        try {
            await newRecipe.save()
            console.log(newRecipe)
            res.redirect('/recipes')
        } catch (err) {
            if (err) return res.status(500).send(err)
            res.redirect('/')
        }
    },
    // not sure if it is an unnecessary piece of code but I cannot 'GET' the edit page without it
    editRecipe: async (req, res) => {
        // const id = req.params.id
        // console.log(id);
        // try {
        //     const comments = await Comment.find()
        //     res.render('editComment.ejs', { editComment : comments, commentId : id})
        // } catch (err) {
        //     if (err) return res.status(500).send(err)
        // }
    },
    updateRecipe: async (req, res) => {
        // const id = req.params.id
        // try {
        //     await Comment.findByIdAndUpdate(id, {
        //         title: req.body.title,
        //         comment: req.body.comment
        //     })
        //     res.redirect('/comments')
        // } catch (err) {
        //     if (err) return res.status(500).send(err)
        //     res.redirect('/comments')
        // }
    },
    deleteRecipe: async (req, res) => {
        // const id = req.params.id
        // try {
        //     const comment = await Comment.findByIdAndDelete(id)
        //     console.log(comment);
        //     res.redirect('/comments')
        // } catch (err) {
        //     if (err) return res.status(500).send(err)
        // }
    }
}