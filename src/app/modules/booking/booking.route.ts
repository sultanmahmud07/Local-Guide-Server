import express from "express";

import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { BookingController } from "./booking.controller";
import { createBookingZodSchema, updateBookingStatusZodSchema } from "./booking.validation";

const router = express.Router();

router.post("/",
    checkAuth(...Object.values(Role)),
    validateRequest(createBookingZodSchema),
    BookingController.createBooking
);

router.get("/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    BookingController.getAllBookings
);

router.get("/my-bookings",
    checkAuth(...Object.values(Role)),
    BookingController.getUserBookings
);

router.get("/:bookingId",
    checkAuth(...Object.values(Role)),
    BookingController.getSingleBooking
);

router.patch("/:bookingId/status",
    checkAuth(...Object.values(Role)),
    validateRequest(updateBookingStatusZodSchema),
    BookingController.updateBookingStatus
);

export const BookingRoutes = router;
