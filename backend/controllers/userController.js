 
import { verifyMail } from "../emailVerify/mailVerify.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req,res)=>{
    try {
        const {username,email,password} = req.body;

        if(!username || !email || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const existUser = await User.findOne({email});
        if(existUser){
            return res.status(400).json({success:false,
                message: "user already exist"
            })
        }
        const hashedpassword = await bcrypt.hash(password,10);
        const createUser = await User.create({username,email, password: hashedpassword});
        
     const token  =  jwt.sign({id:createUser._id},process.env.SECRET_KEY,{expiresIn:"10m"})

       verifyMail(token,email);
       createUser.token = token;
       await createUser.save();


        return res.status(201).json({success:true,
            message:"User registered successfully",
            data: createUser
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const verification = async (req,res)=>{
   try {
      const authHeader = req.headers.authorization;
      if(!authHeader || !authHeader.startsWith("Bearer ")){
         return res.status(401).json({
            success:false,
            message: "Authorization token is missing or invalid"
         })
      }

      const token = authHeader.split(" ")[1]
      let decoded;
      try{
    decoded = jwt.verify(token,process.env.SECRET_KEY);
      }catch(error){
      if(error.name === "TokenExpiredError"){
         return res.status(400).json(
            {
               success: false,
               message: "The registration token has expired"
            }
         )
      }
      return res.status(400).json({
         success:false,
         message: "Token verification failed"
      })
      }
      const user = await User.findById(decoded.id);
      if(!user){
         return res.status(404).json({
            success:false,
            message: "user not found",
         })
      }
      user.token = null;
      user.isVerified = true;
      await user.save();
      return res.status(200).json({successs:true, message:"Email verified successfully"});
   } catch (error) {
      return res.status(500).json({success:false, message:error.message});
      
   }

}

export const loginUser = async (req,res)=>{
    try {
        const {email,password} = req.body;

     if(!email || !password){
        return res.status(400).json({
            success:false,
            message: "All fields are required",
        })
     }
     const loginUser = await User.findOne({email});

     if(!loginUser){
        return res.status(401).json({
            success: false,
            message: "user don't exist",
        })
     }

     const checkpassword = await bcrypt.compare(password,loginUser.password);

     if(!checkpassword){
        return res.status(402).json({
            success:false,
            message: "password is incorrect",
        })
     }

     //check if user is verified

     if(!loginUser.isVerified){
        return res.status(403).json({
            success: false,
            message:"Verify user then login"

        })

     }

     

     return res.status(201).json({
        success: false,
        message: "user login successfully",
        data: loginUser,

     })
    

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,

        })
        
    }
}