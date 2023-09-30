import express from 'express';
const router = express.Router();
import { getComments, getOneComment, editComments, createComment, updateComment, deleteComment } from '../controllers/comments.js';


// * Handles initial GET request for the comments page
router.get('/', getComments); // read
// Gets the page to view a full comment
router.get('/viewComment/:id', getOneComment); // read
// getting the edit page
router.get('/edit/:id', editComments); // read

//* Handles POST method request for adding a new comments

router.post('/',createComment); // create

//* Handles POST method request for editing comments
router.post('/update/:id', updateComment);

//* Handles POST method request for deleting comments
router.get('/delete/:id', deleteComment);

export default router