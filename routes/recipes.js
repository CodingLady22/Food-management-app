const express = require('express');
const router = express.Router();
const upload = require("../middleware/multer");
const recipesController = require('../controllers/recipes');
// const homeController = require('../controllers/home')

// * Handles initial GET request on the homepage

router.get('/', recipesController.getRecipes) // read
router.get('/viewRecipe/:id', recipesController.singleRecipe) // read
// router.get('/edit/:id', recipesController.editRecipe) // read edit page


//* Handles POST method request for adding a new item

router.post('/newRecipe', upload.single("file"), recipesController.createRecipe) // create recipe on app
router.post('/recipe', upload.single("pdf"), recipesController.addRecipe) // import recipe into app
router.put('/updateOneRecipe/:id', recipesController.updateRecipe) // update
router.put('/updateImageRecipe/:id', upload.single("editFile"), recipesController.updateRecipeImage) // update
router.delete('/deleteOneRecipe/:id', recipesController.deleteRecipe) // delete
router.get('/deleteUpload/:id', recipesController.deleteUploadedRecipe) // delete

module.exports = router