// const cloudinary = require("cloudinary").v2;
import {v2 as cloudinary} from 'cloudinary'
//! check if this line below is needed
// import { CloudinaryStorage } from "multer-storage-cloudinary";

// require("dotenv").config({ path: "./config/.env" });
import dotenv from 'dotenv'
dotenv.config({ path: './config/.env' })

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export default cloudinary;
