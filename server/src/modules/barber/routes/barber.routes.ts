import { Router } from "express";
import multer from "multer";
import {
    getActiveBarbersController,
    getBarberByIdController,
    uploadAvatarController,
    deleteAvatarController
} from "../controllers/barber.controller";
import { verifyToken } from "../../auth/middleware/verifyToken";

const router = Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Public routes
router.get("/", getActiveBarbersController);
router.get("/:barberId", getBarberByIdController);

// Protected routes (barber only)
router.post("/avatar", verifyToken, upload.single('avatar'), uploadAvatarController);
router.delete("/avatar", verifyToken, deleteAvatarController);

export default router;
