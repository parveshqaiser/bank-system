
import UserModel from "../models/user.model.js";
import { checkInputValidation } from "../utils/validation.js";

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

        let inputError = checkInputValidation(name,email, password);

        if(inputError){
            return res.status(400).json({
                message: inputError,
                success: false,
            });
        }

        let user = await UserModel.findOne({email});

        if(!user){
            return res.status(400).json({
                message : "User Doesnot Exist",
                success : false
            });
        }


    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}

