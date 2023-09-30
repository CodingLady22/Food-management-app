import express from 'express';
const router = express.Router();
// import upload from "../middleware/multer.js";
// import { upload } from "multer";
import upload from "../middleware/multer.js";
// import multer from "../middleware/multer.js";
import { getRecipes, recipeFeed, singleRecipe, displaySavedRecipes, createRecipe, saveRecipe, updateRecipe, deleteRecipe } from "../controllers/recipes.js";


// * Handles initial GET request on the homepage
router.get('/', getRecipes) // read
router.get('/viewRecipe/:id', singleRecipe) // read
router.get('/viewRecipeFeed', recipeFeed) // read
// router.get('/edit/:id', recipesController.editRecipe) // read edit page
router.get('/savedRecipes', displaySavedRecipes)

//* Handles POST method request for adding a new item

router.post('/newRecipe', upload.single("file"), createRecipe) // create recipe on app
// router.post('/recipe', upload.single("pdf"), addRecipe) // import recipe into app
router.post('/saveRecipe/:id', saveRecipe)
router.put('/updateOneRecipe/:id', upload.single("editFile"), updateRecipe) // update entire recipe
router.delete('/deleteOneRecipe/:id', deleteRecipe) // delete
// router.get('/deleteUpload/:id', deleteUploadedRecipe) // delete


export default router 