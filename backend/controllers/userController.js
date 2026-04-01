import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";

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