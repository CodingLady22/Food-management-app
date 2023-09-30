import express from 'express';
const router = express.Router();
import { getDashboard, getExpiringItems, editItems, createItem, updateItem, deleteItem } from '../controllers/dashboard.js';
import { ensureAuth, ensureGuest } from "../middleware/auth.js";

// * Handles initial GET request from the homepage

router.get('/', ensureAuth, getDashboard) // read
router.get('/expiring', getExpiringItems) // read
router.get('/edit/:id', editItems) // read


//* Handles POST method request for adding a new item

router.post('/dashboard', createItem) // create
router.post('/update/:id', updateItem) // update
router.get('/delete/:id', deleteItem) // delete 

export default router