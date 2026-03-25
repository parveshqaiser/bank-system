
import mongoose from "mongoose";

const dbConnection = async()=>{

    await mongoose.connect(process.env.MONGO_DB_URI);
}

export default dbConnection;