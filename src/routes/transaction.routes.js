
import express from "express";
// import { authenticateUser } from "../middlewares/auth.middleware.js";
import { depoistFromSystemAccount } from "../controllers/transaction.controller.js";


const router = express.Router();

router.post("/deposit", depoistFromSystemAccount);


export default router;