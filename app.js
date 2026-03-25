import dotnev from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";
import accountRoutes from "./src/routes/account.routes.js";

import cookieParser from "cookie-parser";
import dbConnection from "./src/config/db.js";

dotnev.config();

let app = express();
app.use(cookieParser());
let PORT = 4000;


app.use(express.json());
app.use(cors());

app.get("/", (req, res)=>{
    res.status(200).json({message : "Testing Server Working Fine", success : true})
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/account", accountRoutes);

dbConnection().then(()=>{
    console.log("DB connected");

    app.listen(PORT,()=>{
        console.log(`Server is running at http://localhost:${PORT}`);
    })
}).catch(err =>{
    console.log("Error in DB connection ", err);
});

