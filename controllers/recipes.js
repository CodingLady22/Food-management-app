const cloudinary = require("../middleware/cloudinary");
const Recipe = require("../models/Recipe")
const User = require("../models/User") //! This model was brought in ONLY for the displaySavedRecipes() because the saved recipes are stored in an array in the User database and I want all methods for the recipes to be in one, this recipe, file
const axios = require("axios");
// const UploadedRecipe = require("../models/UploadedRecipe")

module.exports = {
    getRecipes: async (req, res) => {
        try {
            const recipes = await Recipe.find({ user: req.user.id })
            res.render('recipes.ejs', { getRecipes: recipes, user: req.user })
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    },
    recipeFeed: async (req, res) => {
        try {
            const recipes = await Recipe.find().sort({ createdAt: "desc" }).populate("user");
            const response = await axios.get('https://lazy-ox-trunks.cyclic.cloud/api/next-quote');
            const quotes = response.data;

            res.render('allRecipes.ejs', { recipes: recipes, quotes: quotes, user: req.user })
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    },
    displaySavedRecipes: async (req, res) => {
        try {
            const user = await User.findById(req.user.id)
            .populate({ path: 'savedRecipes', populate: { path: 'user' } });

            const response = await axios.get('https://lazy-ox-trunks.cyclic.cloud/api/next-quote');
            const quotes = response.data;
            res.render('savedRecipes.ejs', { savedRecipes: user.savedRecipes, quotes: quotes, user: req.user })
        } catch (err) {
            console.error('Error fetching saved recipes:', err);
            res.status(500).send('Error fetching saved recipes');
        }
    },
    // Controller method to save a recipe for a user
    saveRecipe: async(req, res) => {
        const userId = req.user.id;
        const recipeId = req.params.id;

        try {
            // Add the recipeId to the savedRecipes array of the user
            await User.findByIdAndUpdate(userId, { $addToSet: { savedRecipes: recipeId } });
            res.redirect('/recipes/viewRecipeFeed'); // Redirect the user back to the recipes page after saving
        } catch (err) {
            if (err) return res.status(500).send(err);
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

        // Convert hashtag string to an array of strings
        let hashtagsArray = [];

        if (req.body.hashtags) {
            if (req.body.hashtags.includes(',')) {
            // Handle comma-separated hashtags
            hashtagsArray = req.body.hashtags.split(',').map(tag => tag.trim()).join(' ');
            } else {
            // Handle space-separated hashtags
            hashtagsArray = req.body.hashtags.split(' ').filter(tag => tag.trim() !== '').join(' ');
            }
        }

        // Handle both comma seperated and space seperated hashtags
        // if (req.body.hashtags) {
        //     hashtagsArray = req.body.hashtags.split(/[, ]+/).filter(tag => tag.trim() !== '').join(' ');
        // }
      
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
                hashtags: hashtagsArray,
                user: req.user.id,
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
    singleRecipe: async (req, res) => {
        try {
            const viewRecipe = await Recipe.findById(req.params.id).populate("user");
            const showEditForm = req.query.edit === 'true';
            res.render('oneRecipe.ejs', { recipe: viewRecipe, user: req.user, showEditForm: showEditForm })
        } catch (err) {
            console.log(err);
        }
    },
    // ! Had a seperate method to update the image before putting all updates in one method
    /*
    updateRecipeImage: async (req, res) => {
        const id = req.params.id;
        try {
            // change name of this variable
            const updatedRecipe = await Recipe.findById(id);
            
            // first check if a new image is being uploaded
            if(req.file) {
                // first upload the new image
                const newImageUpload = await cloudinary.uploader.upload(req.file.path);
                const newImagePublicId = newImageUpload.public_id;

                // next, retrieve the existing image details from the database
                const oldImagePublicId = updatedRecipe.cloudinaryId;

                // then delete the old image from cloudinary
                await cloudinary.uploader.destroy(oldImagePublicId);

                // lastly, update the image URL and cloudinary id in the database
                updatedRecipe.image = newImageUpload.secure_url;
                updatedRecipe.cloudinaryId = newImagePublicId;
            }
            await updatedRecipe.save();
            console.log("Image has been updated")
            res.redirect(`/recipes/viewRecipe/${id}`)
            
        } catch (err) {
            res.status(500).send('Error retrieving image for editing.')
        }
    },
    */
    updateRecipe: async (req, res) => {
        const id = req.params.id;
        try {
            const { title, prep, cook, total, serving, ingredients, instructions, hashtags } = req.body;
            const updatedRecipe = await Recipe.findById(id);

            // first check if a new image is being uploaded
            if(req.file) {
                // first upload the new image
                const newImageUpload = await cloudinary.uploader.upload(req.file.path);
                const newImagePublicId = newImageUpload.public_id;

                // next, retrieve the existing image details from the database
                const oldImagePublicId = updatedRecipe.cloudinaryId;

                // then delete the old image from cloudinary
                await cloudinary.uploader.destroy(oldImagePublicId);

                // lastly, update the image URL and cloudinary id in the database
                updatedRecipe.image = newImageUpload.secure_url;
                updatedRecipe.cloudinaryId = newImagePublicId;
            }

            // now update the other recipe details in the database
            await Recipe.findByIdAndUpdate(updatedRecipe, {
                title,
                prep,
                cook,
                total,
                serving,
                ingredients,
                instructions,
                hashtags,
            });

        //    save the updated recipe in the database
        await updatedRecipe.save();
        
            console.log("Recipe has been updated")
            res.redirect(`/recipes/viewRecipe/${id}`)
        } catch (err) {
            res.status(500).send('Error retrieving recipe for editing.')
        }
    },
    // updateRecipe: async (req, res) => {
    //     const id = req.params.id
    //     try {
    //         const updatedRecipe = {
    //             title: req.body.title,
    //             // image: result.secure_url,
    //             prep: req.body.prep,
    //             cook: req.body.cook,
    //             total: req.body.total,
    //             serving: req.body.serving,
    //             ingredients: req.body.ingredients,
    //             instructions: req.body.instructions,
    //         }
    //         await Recipe.findByIdAndUpdate(id, updatedRecipe);
    //         console.log("Recipe has been updated")
    //         res.redirect('/recipes')
    //     } catch (err) {
    //         if (err) return res.status(500).send(err)
    //         res.redirect('/recipes')
    //     }
    // },
    deleteRecipe: async (req, res) => {
        //   Find post by id
        const id = req.params.id
        try {
            // let recipe = await Recipe.findById({ id: req.params.id });
        let recipe = await Recipe.findByIdAndDelete(id);

      // Delete image from cloudinary
      await cloudinary.uploader.destroy(recipe.cloudinaryId);
      // Delete post from db
    //   await Recipe.remove({ id: req.params.id });
      await Recipe.findByIdAndDelete(id);
      console.log("Recipe has been deleted");
            res.redirect('/recipes')
    } catch (err) {
      err.status(500).send(err)
      res.redirect('/recipes')
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