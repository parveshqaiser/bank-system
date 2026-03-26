import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    fromAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "account",
        required : true,
    },
    toAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "account",
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

let TransactionModel = mongoose.model("transaction", TransactionSchema);

export default TransactionModel;
