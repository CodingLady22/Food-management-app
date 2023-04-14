const cloudinary = require("../middleware/cloudinary");
const Recipe = require("../models/Recipe")
// const UploadedRecipe = require("../models/UploadedRecipe")

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
        // try {
            // Upload pdf to cloudinary
        // const result = await cloudinary.uploader.upload(req.file.path);

        // await UploadedRecipe.create({
        //     title: req.body.title,
        //     pdf: result.secure_url,
        //     cloudinaryId: result.public_id,
        //     tags: req.body.tags
        // });
        //     console.log("Recipe has been uploaded")
        //     res.redirect('/recipes');
        // } catch (err) {
        //     if (err) return res.status(500).send(err)
        //     res.redirect('/')
        // }
    },
    createRecipe: async (req, res) => {
        // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      
       const newRecipe = new Recipe(
            {
                title: req.body.title,
                image: result.secure_url,
                cloudinaryId: result.public_id,
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
        try {
    //   Find post by id
      let recipe = await Recipe.findByIdAndDelete(id);

      // Delete image from cloudinary
      await cloudinary.uploader.destroy(recipe.cloudinaryId);
      console.log("Recipe has been deleted");
            res.redirect('/recipes')
    } catch (err) {
      if (err) return res.status(500).send(err)
    }
    },
    deleteUploadedRecipe: async (req, res) => {
        // try {
    //   Find post by id
    //   let uploadedRecipe = await UploadedRecipe.findByIdAndDelete(id)

      // Delete image from cloudinary
    //   await cloudinary.uploader.destroy(uploadedRecipe.cloudinaryId);
    //   console.log("Recipe pdf has been deleted");
    //         res.redirect('/recipes')
    // } catch (err) {
    //   if (err) return res.status(500).send(err)
    // }
    }
}