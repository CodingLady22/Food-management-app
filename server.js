// todo - Declare Variables
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require('passport');
const session = require('express-session');
const MongoStore = require("connect-mongo");
const flash = require("express-flash");
const logger = require("morgan");
const dashboardRoutes = require("./routes/dashboard");
const commentsRoutes = require("./routes/comments");
const recipesRoutes = require("./routes/recipes");
const homeRoutes = require("./routes/home");
const PORT = 3700


    //*Import functions/routes
    const connectDB = require("./config/database")

    // Passport config
require("./config/passport")(passport);

require('dotenv').config({ path: './config/.env' })


// todo - connect to Database
connectDB()



//todo - Set Middleware
app.set("view engine", "ejs") 
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

//Logging
app.use(logger("dev"));

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
//!  Why is my 'process.env.PORT' not working?
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
// app.listen(process.env.PORT, () => {
//     console.log(`Server running on port ${process.env.PORT}`)
// });
