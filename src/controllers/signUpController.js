const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const{findUserByEmailorUsername, createUser}=require('../models/userModel');

exports.signUp=async(req,res)=>{
    try {
        const{username, email,password}=req.body;
        const role='user';

        if(!username || !email || !password){
            return res.status(400).json({message:"All fields are requried"});
        }

        const exisitingUser= await findUserByEmailorUsername(email, username);
        if(exisitingUser){
            return res.status(409).json({message: 
                "User already exisits !! Please Login"
            });
        }

        const salt= await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const createdUser=await createUser({
            username,
            email,
            password_hash:hashedPassword,
            role
        });

        const token= jwt.sign(
            {user_id:createdUser.user_id, role: createdUser.role},
                process.env.JWT_SECRET,
            {expiresIn: '1h'},
        );

        return res.status(201).json({
            message: "Signup Successful",
            user: createUser,
            token
        });
    } catch (error) {
        
        console.error("Signup Error",error);
        return res.status(500).json({message:"Internal Server Error"});
    }
};