import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { verifyToken } from "../../auth/middleware/verifyToken";

const router = Router();

// Customer routes
router.get("/available-slots", verifyToken, bookingController.getAvailableSlots);
router.post("/", verifyToken, bookingController.createBooking);
router.get("/my-bookings", verifyToken, bookingController.getMyBookings);
router.patch("/:id/cancel", verifyToken, bookingController.cancelBooking);

// Barber routes
router.get("/barber/schedule", verifyToken, bookingController.getBarberSchedule);
router.patch("/:id/status", verifyToken, bookingController.updateBookingStatus);
router.patch("/:id/price", verifyToken, bookingController.updateBookingPrice);
router.patch("/:id/reschedule", verifyToken, bookingController.rescheduleBooking);
router.delete("/:id", verifyToken, bookingController.deleteBooking);

// Daily earnings routes (barber only)
router.post("/earnings/manual", verifyToken, bookingController.addManualEarning);
router.get("/earnings", verifyToken, bookingController.getDailyEarnings);

export default router;
