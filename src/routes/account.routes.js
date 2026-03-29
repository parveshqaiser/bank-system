
import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { createAccount, getAccountDetails } from "../controllers/account.controller.js";
import limiter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/", authenticateUser, createAccount);
router.get("/:id", authenticateUser, limiter, getAccountDetails);


export default router;