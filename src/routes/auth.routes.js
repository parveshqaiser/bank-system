
import express from "express";
import { userRegistration } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/", userRegistration);

export default router;