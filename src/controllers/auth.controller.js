
import UserModel from "../models/user.model.js";
import { checkInputValidation } from "../utils/validation.js";
import jwt from "jsonwebtoken";

export const userRegistration = async(req, res)=>{
    try {
        let {name, email, password} = req.body;

        let inputError = checkInputValidation(name,email, password);

        if(inputError){
            return res.status(400).json({
                message: inputError,
                success: false,
            });
        }

        let user = await UserModel.findOne({email});

        if(user){
            return res.status(400).json({
                message : "User Exist. Please Log In",
                success : false
            });
        }

        let createUser = await UserModel.create({
            name,
            email,
            password
        })

        res.status(201).json({
            message : "User Registered Successfully",
            success: true
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}

export const userLogin = async(req, res)=>{

    try {
        let {email, password} = req.body;

        let inputError = checkInputValidation(email, password);

        if(inputError){
            return res.status(400).json({
                message: inputError,
                success: false,
            });
        }

        let user = await UserModel.findOne({email});

        if(!user){
            return res.status(404).json({
                message : "User Doesnot Exist",
                success : false
            });
        }

        let isPasswordCorrect = user.password == password ? true : false;

        if(!isPasswordCorrect){
            return res.status(400).json({
                message : "Invalid Email or Password",
                success : false
            });
        }

        let accessToken = jwt.sign({id:user._id,email : user.email},
            process.env.SECRET_KEY,
            {expiresIn:"1hr"},
        );

        res.status(200).cookie("token", accessToken,{
            sameSite : "strict",
            secure: true,
            httpOnly:true
        }).json({
            message : `Login Successful. Welcome back ${user.name}`,
            success : true
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}

export const userLogout = async(req, res)=>{
    try {
        let currentUser = req.user;

        let user = await UserModel.findById(currentUser.id);

        if(!user){
            return res.status(404).json({
                message : "Invalid User",
                success : false
            });
        }

        let data = {name : user.name};

        res.status(200).clearCookie("token",{
            sameSite: "strict",
            secure: true,
            httpOnly: true,
        }).json({
            message: "User Logout Success",
            success: true,
            data: data
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}

