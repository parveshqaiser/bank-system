
import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { createTransferFunds, depoistFromSystemAccount } from "../controllers/transaction.controller.js";


const router = express.Router();

router.post("/deposit", depoistFromSystemAccount);
router.post("/transfer/funds",authenticateUser, createTransferFunds);


export default router;