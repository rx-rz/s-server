import { z } from "zod";

// const updateBookingPaymentStatusValidator = z.object({
//   status: z.enum(["pending", "confirmed"]).default("pending").optional(),
//   payedAt: z.coerce.date().optional(),
// });

const makePaymentValidator = z.object({
  bookingId: z.string({ required_error: "Booking ID must be provided." }),
  email: z
    .string({ required_error: "Email must be provided" })
    .email({ message: "Email provided is not a valid email." }),
});

const paymentIDValidator = z.object({
  id: z.string({ required_error: "Payment ID must be provided." }),
});

export const v = {
  makePaymentValidator,
  paymentIDValidator,
};
