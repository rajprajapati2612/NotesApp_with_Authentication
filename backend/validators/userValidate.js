import yup from "yup";

export const userSchema = yup.object({
    username: yup.string().trim().min(3,"username must be atleast of 3 characters")
    .required(),
    email: yup.string().email("the email is not valid one")
    .required(),
    password: yup.string().min(6,"Password must be atleast of 6 character")
    .required(),

})


export const validateUser  = (schema)=> async (req,res,next)=>{
try {
    await schema.validate(req.body);
    next();
} catch (error) {
    return res.status(500).json({errors:error})
    
}

}

