import { z } from "zod";

const updatePaymentStatusValidator = z.object({
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
  updatePaymentStatusValidator,
  makePaymentValidator,
  paymentIDValidator,
};
