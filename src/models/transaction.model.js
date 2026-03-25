import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    fromAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true,
    },
    toAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true,
    },
    amount : {
        type : Number,
        required : true,
    },
    idempotencyKey : {
        type : String,
        unique: true,
    },
    status : {
        type : String,
        enum : ["PENDING","COMPLETED","FAILED","REVERSED"],
        default : "PENDING",
    }
},{timestamps:true});

// AccountSchema.index({userId:1, accountNumber:1});

let TransactionModel = mongoose.model("transaction", TransactionSchema);

export default TransactionModel;
