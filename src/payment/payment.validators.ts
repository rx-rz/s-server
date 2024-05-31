import { z } from "zod";

const updateBookingPaymentStatusValidator = z.object({
  status: z.enum(["pending", "confirmed"]).default("pending").optional(),
  payedAt: z.coerce.date().optional(),
});

const makePaymentValidator = z.object({
  amount: z.coerce.string(),
  bookingId: z.string(),
  email: z.string().email(),
});

const paymentIDValidator = z.object({
  id: z.string(),
});

export const v = {
  makePaymentValidator,
  paymentIDValidator,
};
