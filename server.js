// todo - Declare Variables
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const PORT = 3000
const dashboardRoutes = require("./routes/dashboard")
const commentsRoutes = require("./routes/comments")
const recipesRoutes = require("./routes/recipes")


    //*Import functions/routes
    const connectDB = require("./config/database")

require('dotenv').config({path: './config/.env'})


// todo - connect to Database
connectDB()



//todo - Set Middleware
app.set("view engine", "ejs") 
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))



//todo - Set Routes
app.use('/', dashboardRoutes)
app.use('/comments', commentsRoutes)
app.use('/recipes', recipesRoutes)



//todo - Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))