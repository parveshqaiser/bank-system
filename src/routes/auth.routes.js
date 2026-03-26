
import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { userLogin, userLogout, userRegistration } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/", userRegistration);
router.post("/login", userLogin);
router.get("/logout", authenticateUser, userLogout);

export default router;