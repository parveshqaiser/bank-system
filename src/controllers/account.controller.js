
import AccountModel from "../models/account.model.js";

export const createAccount = async(req, res)=>{
    try {
        let currentUser = req.user;

        let user = await AccountModel.create({
            userId : currentUser.id
        });

        res.status(201).json({
            message : "Account Created",
            success: true,
            currentUser
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}