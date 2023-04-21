const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth");
// const commentsController = require('../controllers/comments')
const homeController = require('../controllers/home')
// const { ensureAuth, ensureGuest } = require("../middleware/auth");

// * Handles initial GET request on the homepage

// const homeController = require("../controllers/home");
// const postsController = require("../controllers/posts");

//Main Routes - simplified for now
router.get("/", homeController.getIndex);
// router.get("/profile", ensureAuth, postsController.getProfile);
// router.get("/feed", ensureAuth, postsController.getFeed);
router.get("/login", authController.getLogin);
// router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin); //new
router.get("/logout", authController.logout); //new
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup); //new

// router.get('/', homeController.getIndex) // read
// router.get('/comment', commentsController.getComments) // read

//* Handles POST method request for adding a new item

// router.post('/dashboard', dashboardController.createItem) // create
// router.post('/comment', commentsController.createComment) // create

module.exports = router