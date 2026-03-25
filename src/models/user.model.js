
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        lowercase : true,
        trim : true,
        index : true,
        unique : [true, "Email Already Exist"]
    },
    password : {
        type : String,
        required : true,
        // select : false
    },
    role : {
        type : String,
        enum : ["USER", "ADMIN"],
        default : "USER"
    }
}, {timestamps: true});


let UserModel = mongoose.model("users", UserSchema);

export default UserModel;