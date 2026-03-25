
import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { createAccount } from "../controllers/account.controller.js";

const router = express.Router();

router.post("/", authenticateUser, createAccount)


export default router;