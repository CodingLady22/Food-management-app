const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments')


// * Handles initial GET request for the comments page
router.get('/', commentsController.getComments) // read
// getting the edit page
router.get('/edit/:id', commentsController.editComments) // read

//* Handles POST method request for adding a new comments
//! Always leave the post blank if it is from a route in the server except it's on the home route in the server
router.post('/', commentsController.createComment) // create

//* Handles POST method request for editing comments
router.post('/update/:id', commentsController.updateComment) // create

//* Handles POST method request for deleting comments
router.get('/delete/:id', commentsController.deleteComment) // create

module.exports = router