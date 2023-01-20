const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard')
const commentsController = require('../controllers/comments')

// * Handles initial GET request from the homepage

router.get('/', dashboardController.getIndex) // read
router.get('/comment', commentsController.getComments) // read

//* Handles POST method request for adding a new item

router.post('/dashboard', dashboardController.createItem) // create
router.post('/comment', commentsController.createComment) // create

module.exports = router