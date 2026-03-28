
import AccountModel from "../models/account.model.js";

export const createAccount = async(req, res)=>{
    try {
        let currentUser = req.user;

        let account = await AccountModel.create({
            userId : currentUser.id
        });

        let data  = {accountNumber : account.accountNumber,...currentUser}

        res.status(201).json({
            message : "Account Created",
            success: true,
            data
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}