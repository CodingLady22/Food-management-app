const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard')

// * Handles initial GET request from the homepage

router.get('/', dashboardController.getIndex) // read

//* Handles POST method request for adding a new item

router.post('/dashboard', dashboardController.createItem) // create

module.exports = router