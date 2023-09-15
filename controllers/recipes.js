/**
 * Controller for managing user recipes, including creation, viewing, editing, deletion, and saving.
 * Handles data retrieval, validation, and rendering of views.
 *
 * @module RecipesController
 */

const cloudinary = require("../middleware/cloudinary");
const Recipe = require("../models/Recipe")
const User = require("../models/User") //! This model was brought in ONLY for the displaySavedRecipes() because the saved recipes are stored in an array in the User database and all methods for the recipes are to be in one file
const axios = require("axios");
// const UploadedRecipe = require("../models/UploadedRecipe")

module.exports = {
    /**
    * Retrieves and renders the user's recipes by querying the database for recipes associated with the current user.
    * Renders the 'recipes.ejs' view with the retrieved recipes and the user object for display.
    *
    * @function
    * @async
    * @param {Object} req - Express request object.
    * @param {Object} res - Express response object.
    * @returns {void}
    */
    getRecipes: async (req, res) => {
        try {
            // Query the database to find recipes associated with the current user
            const recipes = await Recipe.find({ user: req.user.id })

            // Render the 'recipes.ejs' view, passing the retrieved recipes and the user object for display
            res.render('recipes.ejs', { getRecipes: recipes, user: req.user })
        } catch (err) {
            // Handle errors and send an appropriate response with a 500 status code
            if (err) return res.status(500).send(err)
        }
    },
    /**
    * Retrieves and renders a feed of all recipes sorted by creation date, including quotes.
    * Integrates with an external API to fetch random quotes.
    *
    * @function
    * @async
    * @param {Object} req - Express request object.
    * @param {Object} res - Express response object.
    * @returns {void}
    */
    recipeFeed: async (req, res) => {
        try {
            // Retrieve all recipes, sorted by creation date, and populate user information
            const recipes = await Recipe.find().sort({ createdAt: "desc" }).populate("user");

            // Fetch random quotes from an external API
            const response = await axios.get('https://lazy-ox-trunks.cyclic.cloud/api/next-quote');
            const quotes = response.data;

             // Render the allRecipes view with recipe and quote data
            res.render('allRecipes.ejs', { recipes: recipes, quotes: quotes, user: req.user })
        } catch (err) {
            // Handle errors and send an appropriate response
            if (err) return res.status(500).send(err)
        }
    },
    /**
    * Displays the saved recipes for the current user by fetching and rendering saved recipes from the database.
    * Retrieves quotes from an external API for display.
    *
    * @function
    * @async
    * @param {Object} req - Express request object.
    * @param {Object} res - Express response object.
    * @returns {void}
    */
    displaySavedRecipes: async (req, res) => {
        try {
            // Retrieve the current user's saved recipes from the database, also populating the user details for each saved recipe
            const user = await User.findById(req.user.id)
            .populate({ path: 'savedRecipes', populate: { path: 'user' } });

            // Fetch quotes from an external API for additional content
            const response = await axios.get('https://lazy-ox-trunks.cyclic.cloud/api/next-quote');
            const quotes = response.data;

             // Render the 'savedRecipes.ejs' view with the retrieved saved recipes, quotes, and user object for display
            res.render('savedRecipes.ejs', { savedRecipes: user.savedRecipes, quotes: quotes, user: req.user })
        } catch (err) {
            // Handle errors, log them, and send an appropriate response with a 500 status code
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
            // Handle errors and send an appropriate response
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
    /**
    * Creates a new recipe by processing user-submitted form data, including image upload to Cloudinary.
    * Converts and stores hashtags as an array of strings.
    *
    * @function
    * @async
    * @param {Object} req - Express request object.
    * @param {Object} res - Express response object.
    * @returns {void}
    */
    createRecipe: async (req, res) => {
        // Upload image to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);

        // Initialize an empty array to store hashtags
        let hashtagsArray = [];

        // Check if hashtags are provided in the request body
        if (req.body.hashtags) {
            // Check if hashtags are comma-separated
            if (req.body.hashtags.includes(',')) {
            // Split, trim, and join the comma-separated hashtags into an array
            hashtagsArray = req.body.hashtags.split(',').map(tag => tag.trim()).join(' ');
            } else {
            // Split, trim, and join space-separated hashtags into an array
            hashtagsArray = req.body.hashtags.split(' ').filter(tag => tag.trim() !== '').join(' ');
            }
        }

        // Handle both comma seperated and space seperated hashtags
        // if (req.body.hashtags) {
        //     hashtagsArray = req.body.hashtags.split(/[, ]+/).filter(tag => tag.trim() !== '').join(' ');
        // }
      
        // Create a new Recipe document with the processed data
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
                note: req.body.note,
                hashtags: hashtagsArray,
                user: req.user.id,
            }
        )
        try {
            // Save the new recipe to the database
            await newRecipe.save()
            // console.log(newRecipe)
            // Redirect the user to the recipes page
            res.redirect('/recipes')
        } catch (err) {
            // Handle errors and send an appropriate response
            if (err) return res.status(500).send(err)
            res.redirect('/')
        }
    },
    /**
 * Displays a single recipe for viewing, including options to edit if specified.
 * Retrieves and renders details of a single recipe by its unique identifier, populating user details.
 *
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
    singleRecipe: async (req, res) => {
        try {
            // Retrieve details of a single recipe by its unique identifier, and populate user details for display
            const viewRecipe = await Recipe.findById(req.params.id).populate("user");

            // Check if the query parameter 'edit' is set to 'true' to determine whether to show the edit form
            const showEditForm = req.query.edit === 'true';

            // Render the 'oneRecipe.ejs' view with the retrieved recipe details, user object, and showEditForm option
            res.render('oneRecipe.ejs', { recipe: viewRecipe, user: req.user, showEditForm: showEditForm })
        } catch (err) {
            // Handle errors
            console.log(err);
        }
    },
    /**
    * Updates a recipe's details, including the option to upload a new image.
    * Retrieves the recipe by its unique identifier, updates its properties with the provided data,
    * and handles the uploading of a new image if specified.
    *
    * @function
    * @async
    * @param {Object} req - Express request object.
    * @param {Object} res - Express response object.
    * @returns {void}
    */
    updateRecipe: async (req, res) => {
        const id = req.params.id;
        try {
            // Destructure recipe details from the request body
            const { title, prep, cook, total, serving, ingredients, instructions, note, hashtags } = req.body;

             // Retrieve the existing recipe by its unique identifier
            const updatedRecipe = await Recipe.findById(id);

            // Check if a new image is being uploaded
            if(req.file) {
                // Upload the new image to Cloudinary
                const newImageUpload = await cloudinary.uploader.upload(req.file.path);
                const newImagePublicId = newImageUpload.public_id;

                // Retrieve the existing image's public ID from the database
                const oldImagePublicId = updatedRecipe.cloudinaryId;

                // Delete the old image from Cloudinary
                await cloudinary.uploader.destroy(oldImagePublicId);

                // Update the image URL and Cloudinary ID in the database
                updatedRecipe.image = newImageUpload.secure_url;
                updatedRecipe.cloudinaryId = newImagePublicId;
            }

            // Update the recipe's properties with the provided data
            await Recipe.findByIdAndUpdate(updatedRecipe, {
                title,
                prep,
                cook,
                total,
                serving,
                ingredients,
                instructions,
                note,
                hashtags,
            });

        //    save the updated recipe in the database
        await updatedRecipe.save();
        
        // Log a success message
            console.log("Recipe has been updated")
            
            // Redirect to the recipes view page after updating
            res.redirect(`/recipes/viewRecipe/${id}`)
        } catch (err) {
            // Handle errors and send an appropriate response
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
        // Find and delete the user's individual recipe based on its unique identifier.
        let recipe = await Recipe.findByIdAndDelete(id);

      // Delete image from cloudinary
      await cloudinary.uploader.destroy(recipe.cloudinaryId);
      // Delete post from db based on its unique identifier.
      await Recipe.findByIdAndDelete(id);
      console.log("Recipe has been deleted");
      // Redirect to the recipes page after deletion
            res.redirect('/recipes')
    } catch (err) {
        // Handle errors and send an appropriate response
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