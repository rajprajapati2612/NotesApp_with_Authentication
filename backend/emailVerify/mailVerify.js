import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";
import { User } from "../models/userModel.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

export const verifyMail = async (token,email)=>{

   const emailTemplateSource = fs.readFileSync(
      path.join(__dirname, "template.hbs"),
      "utf-8"
   )
   const template = handlebars.compile(emailTemplateSource);
   const htmlToSend = template({token: encodeURIComponent(token)}); 
   const transporter =  nodemailer.createTransport({
      service:"gmail",
      auth:{
         user:process.env.MAIL_USER,
         pass:process.env.MAIL_PASS
      }
   })

   const mailconfigurations = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Email verification",
      html: htmlToSend,

   }
   transporter.sendMail(mailconfigurations, (error,info)=>{
     if(error){
      throw new Error(error);
     }
     console.log("email sent successfully");
     console.log(info);
   })

}


