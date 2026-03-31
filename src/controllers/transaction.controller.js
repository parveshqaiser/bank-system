

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

export const createTransferFunds = async(req, res)=>{
    let session = null;
    let currentUser = req.user;
    
    try {
        let {fromAccountId, toAccountId, amount, idempotencyKey, remarks} = req.body;
        
        let inputError = checkInputValidation(fromAccountId, toAccountId, amount, idempotencyKey);
        if(inputError){
            return res.status(400).json({
                message: inputError,
                success: false,
            });
        }
        
        if(fromAccountId == toAccountId){
            return res.status(400).json({
                message: "Invalid Account Transfer"
            });
        }
        
        if (amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0",
                success: false
            });
        }
        
        // Start session
        session = await mongoose.startSession();
        session.startTransaction();
        
        try {

            let existingTransaction = await TransactionModel.findOne({ 
                idempotencyKey 
            }).session(session);
            
            if (existingTransaction) {
                await session.commitTransaction();
                await session.endSession();
                
                let statusMessages = {
                    "PENDING": "Transaction Still Processing",
                    "COMPLETED": "Transaction Already Completed",
                    "FAILED": "Transaction failed"
                };
                
                let statusCode = existingTransaction.status === "FAILED" ? 400 : 
                    existingTransaction.status === "PENDING" ? 202 : 200;
                
                return res.status(statusCode).json({
                    message: statusMessages[existingTransaction.status],
                    success: existingTransaction.status === "COMPLETED",
                    // data: existingTransaction.status === "COMPLETED" ? existingTransaction : undefined
                });
            }
            
            let fromAcc = await AccountModel.findOne({_id: fromAccountId, status:"ACTIVE"}).session(session);
            let toAcc = await AccountModel.findOne({_id: toAccountId, status:"ACTIVE"}).session(session);
            
            if(!fromAcc || !toAcc){
                await session.abortTransaction();
                await session.endSession();
                return res.status(404).json({
                    message: "Account Does not Exist",
                    success: false
                });
            }
            
            if (fromAcc.balance < amount) {
                await session.abortTransaction();
                await session.endSession();
                return res.status(400).json({
                    message: `Insufficient Balance. ₹${fromAcc.balance} available`,
                    success: false
                });
            }
            
            fromAcc.balance -= amount;
            toAcc.balance += amount;
            
            await fromAcc.save({ session });
            await toAcc.save({ session });
            
            let [txn] = await TransactionModel.create([{
                fromAccount: fromAcc._id,
                toAccount: toAcc._id,
                amount: amount,
                idempotencyKey,
                status: "COMPLETED",
                remarks: remarks || ""
            }], { session });
            
        
            // ledger entries
            await LedgerModel.insertMany([
                {
                    accountId: fromAcc._id,
                    amount: amount,
                    transactionId: txn._id,
                    accountNumber: fromAcc.accountNumber,
                    type: "DEBIT",
                    balanceAfter: fromAcc.balance,
                    remarks: remarks || ""
                },
                {
                    accountId: toAcc._id,
                    amount: amount,
                    transactionId: txn._id,
                    accountNumber: toAcc.accountNumber,
                    type: "CREDIT",
                    balanceAfter: toAcc.balance,
                    remarks: remarks || ""
                }
            ], { session });
            
            await session.commitTransaction();
            await session.endSession();
            
            res.status(201).json({
                message: "Transfer Funds Successful",
                success: true,
                data: txn
            });
            
        } catch (error) {
            await session.abortTransaction();
            await session.endSession();
            throw error;
        }
        
    } catch (error) {
        if (session) {
            await session.endSession();
        }
        
        console.error("Transfer Fund error:", error);
        res.status(500).json({ 
            message: "Transfer Fund Failed", 
            error: error.message, 
            success: false 
        });
    }
}



// 1. check whether account exist & status is in "ACTIVE" state
// 2. check "from & to" should not be same
// 3. check idempotencyKey Exist || transactionId key
// 4. if exist , check for all status
// 5. check balance of sender
