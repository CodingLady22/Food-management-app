const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments')


// * Handles initial GET request for the comments page
router.get('/', commentsController.getComments) // read
// Unnecessary
router.get('/edit/:id', commentsController.editComments) // read

//* Handles POST method request for adding a new comments
// router.post('/comment', commentsController.createComment) // create

//* Handles POST method request for editing comments
router.post('/update/:id', commentsController.updateComment) // create

//* Handles POST method request for deleting comments
router.get('/delete/:id', commentsController.deleteComment) // create

module.exports = router