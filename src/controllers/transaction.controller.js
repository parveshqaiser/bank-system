

import { checkInputValidation } from "../utils/validation.js";
import AccountModel from "../models/account.model.js";
import TransactionModel from "../models/transaction.model.js";
import LedgerModel from "../models/ledger.model.js";
import mongoose from "mongoose";


export const depoistFromSystemAccount = async (req, res) => {
    let session = null;
    
    try {
        let { toAccountId, amount, idempotencyKey } = req.body;

        let inputError = checkInputValidation(toAccountId, amount, idempotencyKey);
        
        if (inputError) {
            return res.status(400).json({
                message: inputError,
                success: false,
            });
        }

        session = await mongoose.startSession();
        
        let userAccount = await AccountModel.findOne({ _id: toAccountId, status: "ACTIVE" }).session(session)

        if (!userAccount) {
            await session.endSession();
            return res.status(404).json({
                message: "Invalid Account",
                success: false
            });
        }

        let isTransactionExist = await TransactionModel.findOne({ idempotencyKey }).session(session);

        if (isTransactionExist) {
            await session.endSession();
            return res.status(200).json({
                message: `Transaction already ${isTransactionExist.status}`,
                success: true
            });
        }

        session.startTransaction();

        let systemAccount = await AccountModel.findOne({ accountType: "SYSTEM" }).session(session);

        if (!systemAccount) {
            throw new Error("System account not found");
        }

        if (systemAccount.balance < amount) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({
                message: "Insufficient Balance In System",
                success: false
            });
        }

        // Transaction
        const [txn] = await TransactionModel.create([{
            fromAccount: systemAccount._id,
            toAccount: userAccount._id,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session });

        systemAccount.balance -= amount;
        userAccount.balance += amount;

        await systemAccount.save({ session });
        await userAccount.save({ session });

        // Ledger Entires
        await LedgerModel.insertMany([
            {
                accountId: toAccountId,
                amount: amount,
                transactionId: txn._id,
                accountNumber : userAccount.accountNumber,
                type: "CREDIT",
                balanceAfter: userAccount.balance,
                description: "Deposit from System"
            },
            {
                accountId: systemAccount._id,
                amount: amount,
                transactionId: txn._id,
                accountNumber : systemAccount.accountNumber,
                type: "DEBIT",
                balanceAfter: systemAccount.balance,
                description: "Deposit to User"
            }
        ], { session });

        txn.status = "COMPLETED";
        await txn.save({ session });

        await session.commitTransaction();
        await session.endSession();

        res.status(201).json({
            message: "Deposit successful",
            success: true,
            data: txn
        });

    } catch (error) {
        if (session) {
            try {
                await session.abortTransaction();
            } catch (abortError) {
                console.error("Error aborting transaction:", abortError);
            }
            await session.endSession();
        }

        console.error("Deposit error:", error);

        res.status(500).json({
            message: "Deposit Failed",
            error: error.message,
            success: false
        });
    }
};

export const createTransaction = async(req, res)=>{

    // 1. check whether account exist & status is in "ACTIVE" state
    // 2. check from & to should not be same
    // 3. check idempotencyKey Exist || transactionId key
    // 4. if exist , check for all status
    // 5. check balance of sender


    try {
        let {fromAccount, toAccount, amount , idempotencyKey} = req.body;

        let inputError = checkInputValidation(fromAccount, toAccount, amount , idempotencyKey);
        
        if(inputError){
            return res.status(400).json({
                message: inputError,
                success: false,
            });
        }

        let fromAcc = await AccountModel.findOne({_id:fromAccount, status:"ACTIVE"});
        let toAcc = await AccountModel.findOne({_id:toAccount , status:"ACTIVE"});

        if (fromAccount === toAccount) {
            return res.status(400).json({
                message: "Invalid Transaction to Same Account",
                success: false
            });
        }

        if(!fromAcc || !toAcc){
            return res.status(404).json({
                message : "Invalid Account",
                success : false
            });
        }

        // check idempotency key exist or not
        let transactionExist = await TransactionModel.findOne({idempotencyKey});

        if(transactionExist){

            if(transactionExist.status == "PENDING"){
                return res.status(200).json({
                    message : "Transaction Still Processing. Please Wait for some time",
                    success : true
                })
            }

            if(transactionExist.status == "COMPLETED"){
                return res.status(200).json({
                    message : "Transaction Completed",
                    success : true
                })
            }

            if(transactionExist.status == "FAILED"){
                return res.status(400).json({
                    message: "Previous transaction failed",
                    success: false
                });
            }
        }

        if(fromAcc.balance <amount){
            return res.status(400).json({
                message: `Insufficient Balance in your account. INR${fromAcc.balance} available`,
                success: false
            });
        }

        let session = await mongoose.startSession();
        session.startTransaction();

        let transaction = await TransactionModel.create({
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status : "PENDING"
        });






    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}