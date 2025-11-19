import { Router } from "express";
import * as barberController from "../controllers/barber.controller";
import { verifyToken } from "../../auth/middleware/verifyToken";

const router = Router();

// Public routes (authenticated users can see barbers)
router.get("/", verifyToken, barberController.getActiveBarbers);
router.get("/:id", verifyToken, barberController.getBarberById);

export default router;
