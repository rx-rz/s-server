import { z } from "zod";

const currentTimestamp = new Date().toISOString();

const createBookingValidator = z
  .object({
    roomNos: z.array(z.number().int().positive()),
    startDate: z.coerce.string().refine((date) => date > currentTimestamp, {
      message: "Start date must be greater than the current date.",
    }),
    amount: z.coerce.string(),
    endDate: z.coerce.string().refine((date) => date > currentTimestamp, {
      message: "End date must be greater than the current date.",
    }),
    customerId: z.string().uuid(),
  })
  .superRefine(({ startDate, endDate }, ctx) => {
    if (endDate < startDate) {
      ctx.addIssue({
        code: "custom",
        message: "End date must be greater than the start date",
        path: ["endDate"],
      });
    }
  });

const bookingIDValidator = z.object({
  id: z.string().uuid(),
});

const updateBookingValidator = z.object({
  id: z.string(),
  roomNos: z.array(z.number()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  customerId: z.string().optional(),
});

export const v = {
  createBookingValidator,
  bookingIDValidator,
  updateBookingValidator,
};
