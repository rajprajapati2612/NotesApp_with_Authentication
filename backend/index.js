import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoute from "./routes/userRoute.js"

dotenv.config();  

const app = express();
 const port = process.env.PORT || 8000;
 app.use(express.json());

 
 app.use("/user", userRoute)

 app.listen(port,()=>{
    connectDB();
    console.log(process.env.MONGO_URL);
    console.log("server is running on port 8000");
 })