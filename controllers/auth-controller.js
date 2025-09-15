const User=require('../models/user');
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const registerUser=async(req,res)=>{
    try{
        //extract user infor from out request body
        const {username, email,password,role}=req.body;

        //check if the user exists
        const checkExistingUser=await User.findOne({$or :[{username},{email}]})
        if(checkExistingUser){
            return res.status(400).json({
                success: false,
                message:'User already exists'
            })
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const newlyCreatedUser=new User({
            username,
            email,
            password:hashedPassword,
            role: role || 'user'
        })
        await newlyCreatedUser.save()

        if(newlyCreatedUser){
            res.status(201).json({
                success:true,
                message:'User registered'
            })
        }
        else{
            return res.status(400).json({
                success: false,
                message:'unable to register user'
            })
        }

    }catch(e){
        console.log(e);
        res.status(500).json({
            success:"false",
            message:"Some error occured"
        })
    }
}

const loginUser=async(req,res)=>{
    try{
        const {username,password,role}=req.body;
        //find if user exist
        const user =await User.findOne({username});
        if(!user){
            return res.status(400).json({
                success: "false",
                message:"Username doesnt exist"
            })
        }
        //if password matches

        const isPasswordMatch=await bcrypt.compare(password,user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success: "false",
                message:"incorrect pass"
            })
        }
        //create user token

        const accessToken=jwt.sign({
            userId:user._id,
            username: user.username,
            role:user.role
        },process.env.JWT_SECRET_KEY,{
            expiresIn:'15m'
        })
        res.status(200).json({
            success:true,
            message:'Logged in successful',
            accessToken
        })


    }catch(e){
        res.status(402).json({
            message:"error occured"
        })

    }
};

const changePassword=async(req,res)=>{
    try{
        const userid=req.userInfo.userId;
        //extract old and new password
        const {oldPassword,newPassword}=req.body;

        //find the current logged in user
        const user=await User.findById(userid);
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
        //if old password matches
        const isPasswordMatch=await bcrypt.compare(oldPassword,user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message:"Password not matching"
            })
        }
        // add the new password
        const salt=await bcrypt.genSalt(10);
        const newHashedPassowrd= await bcrypt.hash(newPassword,salt);

        //save the password
        user.password=newHashedPassowrd
        await user.save();
        res.status(200).json({
            success:true,
            message:"Password changed"
        })
    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"error occured while changing password"
        })

    }
}

module.exports={loginUser,registerUser,changePassword};