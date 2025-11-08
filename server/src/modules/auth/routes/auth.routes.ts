import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.get("/reset-password/:id/:token", authController.verifyResetToken);
router.post("/reset-password/:id/:token", authController.resetPassword);

export default router;
