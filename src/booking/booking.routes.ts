import { Router } from "express";
import { bookingHandlers } from "./booking.handlers";
import { bookingRoutes } from "../routes";
import { adminAccessOnly } from "../middleware/determine-user-role";

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
  bookingRoutes.update_booking_payment_status,
  bookingHandlers.updateBookingAndBookingPaymentStatus
);
bookingRouter.get(
  bookingRoutes.check_expired_bookings,
  bookingHandlers.checkExpiredBookings
);
