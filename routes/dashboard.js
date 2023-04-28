const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard')
// const commentsController = require('../controllers/comments')
const { ensureAuth, ensureGuest } = require("../middleware/auth");

// * Handles initial GET request from the homepage

router.get('/', ensureAuth, dashboardController.getDashboard) // read
router.get('/edit/:id', dashboardController.editItems) // read


//* Handles POST method request for adding a new item

router.post('/dashboard', dashboardController.createItem) // create
router.post('/update/:id', dashboardController.updateItem) // update
router.get('/delete/:id', dashboardController.deleteItem) // delete - check if POST works or needs READ instead

module.exports = router