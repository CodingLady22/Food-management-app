import express from 'express';
const router = express.Router();
import { getLogin, postLogin, getSignup, postSignup, logout } from "../controllers/auth.js";
import homeController from "../controllers/home.js";


// * Handles initial GET request on the homepage

//Main Routes 
router.get("/", homeController.getIndex);
router.get("/login", getLogin);

router.post("/login", postLogin);
router.get("/logout", logout); 
router.get("/signup", getSignup);
router.post("/signup", postSignup); 


export default router