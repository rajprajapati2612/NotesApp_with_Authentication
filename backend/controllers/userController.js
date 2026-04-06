 
import { verifyMail } from "../emailVerify/mailVerify.js";
import { sendOtpMail } from "../emailVerify/sendOtpMail.js";
import { Session } from "../models/sessionModel.js";
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
     console.log(email, password);
     const loginUser = await User.findOne({email});
     console.log(loginUser);

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

     //check for existing session and delete it
     
     const existingSession = await Session.findOne({userId:loginUser._id});

     if(existingSession){
      await Session.deleteOne({userId:loginUser._id});
     }
    

     //create a new session

     await Session.create({userId:loginUser._id});

     //generate tokens
     const accessToken = jwt.sign({id:loginUser._id},process.env.SECRET_KEY,{expiresIn:"10d"});
     const refreshToken  =  jwt.sign({id:loginUser._id},process.env.SECRET_KEY,{expiresIn:"30d"});

     loginUser.isLoggedIn = true;
      
     await loginUser.save();

     

     return res.status(200).json({
        success: false,
        message: `Welcome to NotesApp ${loginUser.username}`,
        accessToken,
        refreshToken,
        data: loginUser,

     })
    
 
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,

        })
        
    }
}


export const logoutUser = async (req,res)=>{
   try {
      const userId = req.userId;

      if (!userId) {
         return res.status(400).json({
            success: false,
            message: "User not authenticated"
         });
      }
      await Session.deleteMany({userId});
      await User.findByIdAndUpdate(userId,{isLoggedIn:false});
      return res.status(200).json({
         success: true,
         message: "Logged out successfully"
      })

   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message
      })
   }
}


export const forgotPassword = async (req,res)=>{
   try {
      const {email} = req.body;
      console.log(req.body);
      console.log(email);
      if(!email){
         return res.status(400).json({
            success: false,
            message: "email is required" 
         })
      }
      const user = await User.findOne({email});

      if(!user){
         return res.status(404).json({
            success:false,
            message: "user not found"
         })
      }

      const otp = Math.floor(100009 + Math.random()*900000).toString();
      const expiry = new Date(Date.now()+10*60*1000);


      user.otp = otp;
      user.otpExpiry = expiry;
      await user.save();

      await sendOtpMail(email,otp);
      return res.status(200).json({
         success:true,
         message: "OTP sent successfully"
      })


   } catch (error) {
     return res.status(500).json({
      success: false,
      message:error.message
     }) 
   }
}


export const verifyOTP = async (req,res)=>{
   const {otp} = req.body;
   

   const email = req.params.email;
   if(!otp){
      return res.status(400).json({
         success: false,
         message:"OTP is required"
      })
   }

   try {
  const user = await User.findOne({email});
  if(!user){
   return res.status(404).json({
      success:false,
      message:" user not found"
   })
  }
  if(!user.otp || !user.otpExpiry){
   return res.status(400).json({
      success:false,
      message: "OTP not generated or already verified"
   })
  }
  if(user.otpExpiry < new Date()){
   return res.status(400).json({
      success: false,
      message:"OTP has expired. Please generate new OTP"
   })
  }
  if(otp !== user.otp){
   return res.status(400).json({
      success: false,
      message:"Incorrect OTP"
   })
  }

  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  return res.status(200).json({
   success: true,
   message:" OTP verified successfully"
  })
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message
      })
      
   }
}


export const changePassword = async (req,res)=>{
   const {newPassword, confirmPassword}  = req.body;
   const email = req.params.email;

   if(!newPassword || !confirmPassword){
      return res.status(400).json({
         success: false,
         message:"All fields are required"
      })
   }

   if(newPassword !== confirmPassword){
      return res.status(400).json({
         success: false,
         message: "Password do not match"
      })
   }

   try {
      const user = await User.findOne({email});

      if(!user){
         return res.status(404).json({
            success: false,
            messsage: "user not found"
         })
      }

      const hashedPassword = await bcrypt.hash(newPassword,10);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({
         success: true,
         message:"Password changed successfully"
      })
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Internal server error"
      })
      
   }

}