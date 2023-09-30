// todo - Declare Variables
import express from "express";
const app = express();
import mongoose from "mongoose";
import dotenv from 'dotenv';
import passport from 'passport';
import confiurePassport from './config/passport.js'
import session from 'express-session';
import MongoStore from "connect-mongo";
import methodOverride from "method-override";
import flash from "express-flash";
import logger from "morgan";
import dashboardRoutes from "./routes/dashboard.js";
import commentsRoutes from "./routes/comments.js";
import recipesRoutes from "./routes/recipes.js";
import homeRoutes from "./routes/home.js";


    //*Import functions/routes
    import connectDB from "./config/database.js";

    // Passport config
confiurePassport(passport)

dotenv.config({ path: './config/.env' })


//todo - Set Middleware
app.set("view engine", "ejs") 
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

//Logging
app.use(logger("dev"));

//Use forms for put / delete
app.use(methodOverride("_method"));

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.CONNECTION_STRING_DB }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());

//todo - Set Routes
app.use('/dash', dashboardRoutes)
app.use('/comments', commentsRoutes)
app.use('/recipes', recipesRoutes)
app.use('/', homeRoutes)



//todo - Start Server
connectDB().then(() => {
  app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT}`)
  });
})
