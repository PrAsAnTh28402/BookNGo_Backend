const {findUserByEmail}=require('../models/userModel');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

exports.login=async(req ,res)=>{

    try{
        const {email,password}=req.body;

        if(!email || !password){
            return res.status(400).json({message:"All fields are required"});
        }

        const existingUser=await findUserByEmail(email);
        if(!existingUser){
            return res.status(404).json({message:"User Not found"});
        }

        const isMatch=await bcrypt.compare(password,existingUser.password_hash);
        if(!isMatch){
            return res.status(401).json({message:"Invalid password"});
        }

        const token=jwt.sign(
            {user_id:existingUser.user_id, role:existingUser.role},
            process.env.JWT_SECRET,
            {expiresIn:'1h'}
        );

        res.status(200).json({
            message:"Login Successful",
            user:{
                user_id:existingUser.user_id,
                name:existingUser.name,
                email:existingUser.email,
                role:existingUser.role,
                created_at: existingUser.created_at
            },
            token
        });
    } catch(err){
        console.error('Login Error:',err);
        res.status(500).json({message: "Internal Server Error"});
    }
};