import cloudinary from "../middleware/cloudinary.js";
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import axios from 'axios';




    const getRecipes = async (req, res) => {
        try {
            const recipes = await Recipe.find({ user: req.user.id }).lean()
            res.render('recipes.ejs', { getRecipes: recipes, user: req.user })
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }

    //* Retrieves and renders a feed of all recipes sorted by creation date, including quotes.
    // * Integrates with an external API to fetch random quotes.
    const recipeFeed = async (req, res) => {
        try {           
            const recipes = await Recipe.find().sort({ createdAt: "desc" }).populate("user").lean();

            let quotes = 'No advice available today';
            try {
                const response = await axios.get('https://food-quotes-api.onrender.com/api/next-quote', {
                timeout: 50000 // added timeout to prevent hanging
            });

            if (response.data) {
                quotes = response.data;
            }

            } catch (error) {
                console.error('Error fetching quote:', error.message);
            }

            res.render('allRecipes.ejs', { recipes: recipes, quotes: quotes, user: req.user })
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }

    //* Displays the saved recipes for the current user by fetching and rendering saved recipes from the database.
    // * Retrieves quotes from an external API for display.
    const displaySavedRecipes = async (req, res) => {
        try {
            const user = await User.findById(req.user.id).lean()
            .populate({ path: 'savedRecipes', populate: { path: 'user' } });

            let quotes = 'No advice available today'

            try {
                const response = await axios.get('https://food-quotes-api.onrender.com/api/next-quote', {
                timeout: 5000
            });

            if (response.data) {
                quotes = response.data;
            }

            } catch (error) {
                console.error('Error fetching quote:', error.message);
            }

            res.render('savedRecipes.ejs', { savedRecipes: user.savedRecipes, quotes: quotes, user: req.user })
        } catch (err) {
            console.error('Error fetching saved recipes:', err);
            res.status(500).send('Error fetching saved recipes');
        }
    } 


    // Controller method to save a recipe for a user
    const saveRecipe = async(req, res) => {
        const userId = req.user.id;
        const recipeId = req.params.id;

        try {
            await User.findByIdAndUpdate(userId, { $addToSet: { savedRecipes: recipeId } });
            res.redirect('/recipes/viewRecipeFeed');
        } catch (err) {
            if (err) return res.status(500).send(err);
        }
    }


    //* Creates a new recipe by processing user-submitted form data, including image upload to Cloudinary.
    // * Converts and stores hashtags as an array of strings.
    const createRecipe = async (req, res) => {

        const result = await cloudinary.uploader.upload(req.file.path);

        let hashtagsArray = [];

        // Check if hashtags are provided in the request body and handle both comma-separated or space-separated cases 
        if (req.body.hashtags) {
            if (req.body.hashtags.includes(',')) {
            hashtagsArray = req.body.hashtags.split(',').map(tag => tag.trim()).join(' ');
            } else {
            hashtagsArray = req.body.hashtags.split(' ').filter(tag => tag.trim() !== '').join(' ');
            }
        }

      
        // Create a new Recipe document with the provided data
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
            await newRecipe.save()

            res.redirect('/recipes')
        } catch (err) {
            if (err) return res.status(500).send(err)
            res.redirect('/')
        }
    }


    // * Displays a single recipe for viewing, including options to edit if requested.

    const singleRecipe = async (req, res) => {
        try {
            const viewRecipe = await Recipe.findById(req.params.id).populate("user");

            const showEditForm = req.query.edit === 'true';

            res.render('oneRecipe.ejs', { recipe: viewRecipe, user: req.user, showEditForm: showEditForm })
        } catch (err) {
            console.log(err);
        }
    }

   
    // * Updates a recipe's details, including the option to upload a new image.
    // * Handles the uploading of a new image if specified.
    const updateRecipe = async (req, res) => {
        const id = req.params.id;
        try {
            const { title, prep, cook, total, serving, ingredients, instructions, note, hashtags } = req.body;

            const updatedRecipe = await Recipe.findById(id);

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

        await updatedRecipe.save();
        
            console.log("Recipe has been updated")
            res.redirect(`/recipes/viewRecipe/${id}`)
        } catch (err) {
            res.status(500).send('Error retrieving recipe for editing.')
        }
    }


    //* Deletes recipes from the users account
    const deleteRecipe = async (req, res) => {
        const id = req.params.id
        try {
        let recipe = await Recipe.findByIdAndDelete(id);
      await cloudinary.uploader.destroy(recipe.cloudinaryId);
      await Recipe.findByIdAndDelete(id);

      console.log("Recipe has been deleted");
            res.redirect('/recipes')
    } catch (err) {
      err.status(500).send(err)
      res.redirect('/recipes')
    }
}

    export {
        getRecipes,
        recipeFeed,
        displaySavedRecipes,
        saveRecipe,
        createRecipe,
        singleRecipe,
        updateRecipe,
        deleteRecipe
    }