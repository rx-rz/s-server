import { Router } from "express";
import { bookingHandlers } from "./booking.handlers";

export const bookingRouter = Router();
bookingRouter.post("/createBooking", bookingHandlers.createBooking);
bookingRouter.patch("/updateBooking", bookingHandlers.updateBooking);
bookingRouter.delete("/deleteBooking", bookingHandlers.deleteBooking);
bookingRouter.get("/bookingDetails", bookingHandlers.getBookingDetails);
bookingRouter.get("/listBookings", bookingHandlers.listBookings);
