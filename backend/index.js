import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";


dotenv.config();  

const app = express();
 const port = process.env.PORT || 8000;

 app.use("/",(req,res)=>{
   res.send("hello world");
 })

 app.listen(port,()=>{
    connectDB();
    console.log(process.env.MONGO_URL);
    console.log("server is running on port 8000");
 })