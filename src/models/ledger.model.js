
import mongoose from "mongoose";

const LedgerSchema = new mongoose.Schema({
    accountId: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "accounts"
    },
    amount : {
        type : Number,
        immutable : true
    },
    transactionId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "transactions",
        immutable : true
    },
    type : {
        type : String,
        enum : ["CREDIT","DEBIT"],
        immutable : true
    },
    balanceAfter : {
        type : Number,
        immutable : true
    },
    description : {
        type : String,
    }
},{timestamps:true});

const preventLedgerModification = ()=>{
    throw new Error("Ledger Entries are immutable");
}

LedgerSchema.pre("findOne",preventLedgerModification);
LedgerSchema.pre("find",preventLedgerModification);
LedgerSchema.pre("findOneAndUpdate",preventLedgerModification);


let LedgerModel = mongoose.model("ledger", LedgerSchema);

export default LedgerModel;
