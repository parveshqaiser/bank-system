
import express from "express";
import { userLogin, userRegistration } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/", userRegistration);
router.post("/login", userLogin);

export default router;