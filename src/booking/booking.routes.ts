import { Router } from "express";
import { bookingHandlers } from "./booking.handlers";
import { bookingRoutes } from "../routes";

export const bookingRouter = Router();
bookingRouter.post(bookingRoutes.create_booking, bookingHandlers.createBooking);
bookingRouter.patch(
  bookingRoutes.update_booking,
  bookingHandlers.updateBooking
);
bookingRouter.delete(
  bookingRoutes.delete_booking,
  bookingHandlers.deleteBooking
);
bookingRouter.get(
  bookingRoutes.booking_details,
  bookingHandlers.getBookingDetails
);
bookingRouter.get(bookingRoutes.list_bookings, bookingHandlers.listBookings);
bookingRouter.post(
  "/updateBookingPaymentStatus",
  bookingHandlers.updateBookingStatus
);
bookingRouter.get(
  "/checkExpiredBookings",
  bookingHandlers.checkExpiredBookings
);
