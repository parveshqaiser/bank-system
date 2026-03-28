
import AccountModel from "../models/account.model.js";
import LedgerModel from "../models/ledger.model.js";

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

export const getAccountDetails = async(req, res)=>{
    try {
        let accNo = req.params.id;
        let currentUser = req.user;

        let loggedInUserAccount = await AccountModel.findOne({accountNumber:accNo, userId :currentUser.id });

        if(!loggedInUserAccount){
            return res.status(403).json({
                message: "You are not authorized to access this account",
                success: false
            });
        }


        let account = await LedgerModel.aggregate(
            [
                {
                    $match: {
                        accountNumber: `${accNo}`
                    }
                },
                {
                    $lookup: {
                        from: "accounts",
                        localField: "accountNumber",
                        foreignField: "accountNumber",
                        as: "accDetails"
                    }
                },
                {
                    $unwind: "$accDetails"
                },
                {
                    $lookup: {
                        from: "users",
                        let: { userId: "$accDetails.userId" },
                        pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$userId"] }
                            }
                        },
                        {
                            $project: {
                                password: 0,
                                createdAt :0,
                                updatedAt : 0
                            }
                        }
                        ],
                        as: "userDetails"
                    }
                },
                {
                    $unwind: "$userDetails"
                },
                {
                    $group: {
                        _id: "$accountId",
                        account: { $first: "$accDetails" },
                        user: { $first: "$userDetails" },
                        transactions: {
                            $push: {
                                _id: "$_id",
                                amount: "$amount",
                                type: "$type",
                                balanceAfter: "$balanceAfter",
                                transactionId: "$transactionId",
                                createdAt: "$createdAt"
                            }
                        }
                    }
                }
            ]
        );

        res.status(200).json({
            message : "Account Details Fetched",
            success : true,
            data : account
        });



    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}

