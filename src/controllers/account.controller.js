
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

        if(!accNo){
             return res.status(404).json({
                message: "Please Provide some Params",
                success: false
            });
        }

        let loggedInUserAccount = await AccountModel.findOne({
            accountNumber:accNo, 
            userId :currentUser.id 
        });

        if(!loggedInUserAccount){
            return res.status(403).json({
                message: "You are not authorized to access this account",
                success: false
            });
        }


        // let account = await LedgerModel.aggregate(
        //     [
        //         {
        //             $match: {
        //                 accountNumber: `${accNo}`
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: "accounts",
        //                 localField: "accountNumber",
        //                 foreignField: "accountNumber",
        //                 as: "accDetails"
        //             }
        //         },
        //         {
        //             $unwind: "$accDetails"
        //         },
        //         {
        //             $lookup: {
        //                 from: "users",
        //                 let: { userId: "$accDetails.userId" },
        //                 pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: { $eq: ["$_id", "$$userId"] }
        //                     }
        //                 },
        //                 {
        //                     $project: {
        //                         password: 0,
        //                         createdAt :0,
        //                         updatedAt : 0
        //                     }
        //                 }
        //                 ],
        //                 as: "userDetails"
        //             }
        //         },
        //         {
        //             $unwind: "$userDetails"
        //         },
        //         {
        //             $group: {
        //                 _id: "$accountId",
        //                 account: { $first: "$accDetails" },
        //                 user: { $first: "$userDetails" },
        //                 transactions: {
        //                     $push: {
        //                         _id: "$_id",
        //                         amount: "$amount",
        //                         type: "$type",
        //                         balanceAfter: "$balanceAfter",
        //                         transactionId: "$transactionId",
        //                         createdAt: "$createdAt"
        //                     }
        //                 }
        //             }
        //         }
        //     ]
        // );

        let account = await AccountModel.aggregate([
            {
                $match: {
                    accountNumber: accNo
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "users"
                }
            },
            {
                $unwind: "$users"
            },
            {
                $lookup: {
                    from: "ledgers",
                    localField: "accountNumber",
                    foreignField: "accountNumber",
                    as: "transaction"
                }
            },
            {
                $project: {
                    account: {
                        accountNumber: "$accountNumber",
                        accountType: "$accountType",
                        balance: "$balance"
                    },
                    user: {
                        _id: "$users._id",
                        name: "$users.name",
                        email: "$users.email"
                    },
                    transaction: {
                        $map: {
                            input: "$transaction",
                            as: "txn",
                            in: {
                                _id: "$$txn._id",
                                amount: "$$txn.amount",
                                type: "$$txn.type",
                                balanceAfter: "$$txn.balanceAfter",
                                transactionId: "$$txn.transactionId",
                                remarks : "$$txn.remarks",
                                createdAt: "$$txn.createdAt"
                            }
                        }
                    }
                }
            }
        ]);

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



// filter options like date from & to time.