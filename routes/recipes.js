const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipes')
// const homeController = require('../controllers/home')

// * Handles initial GET request on the homepage

router.get('/', recipesController.getRecipes) // read
router.get('/edit/:id', recipesController.editRecipe) // read edit page


//* Handles POST method request for adding a new item

router.post('/newRecipe', recipesController.createRecipe) // create recipe on app
router.post('/recipe', recipesController.addRecipe) // import recipe into app
router.post('/update/:id', recipesController.updateRecipe) // update
router.get('/delete/:id', recipesController.deleteRecipe) // delete

module.exports = router