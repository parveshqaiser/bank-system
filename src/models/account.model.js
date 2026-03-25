
import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required: function () {
            return this.accountType === "USER";
        },
        index : true
    },
    accountType: {
        type: String,
        enum: ["USER", "SYSTEM"],
        default: "USER"
    },
    status : {
        type : String,
        enum : {
            values : ["ACTIVE", "FROZEN", "CLOSED"],
            message : "Bank Account Status can be either Active, Frozen or Closed"
        },
        default : "ACTIVE"
    },
    accountNumber : {
        type : String,
        default : ()=> `ACC${Math.floor(10000000 + Math.random() * 90000000)}`, // 11 digit
    },
    balance : {
        type : Number,
        default : 0,
        min:0,
    },
    currency : {
        type : String,
        default : "INR"
    }
}, {timestamps: true});

AccountSchema.index({userId:1, accountNumber:1});

let AccountModel = mongoose.model("account", AccountSchema);

export default AccountModel;