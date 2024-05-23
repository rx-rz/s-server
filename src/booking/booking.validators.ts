import { z } from "zod";

const currentTimestamp = new Date();

const createBookingValidator = z
  .object({
    roomNos: z.array(z.number().int().positive()),
    startDate: z.coerce.date().refine((date) => date > currentTimestamp, {
      message: "Start date must be greater than the current date.",
    }),
    endDate: z.coerce.date().refine((date) => date > currentTimestamp, {
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
  roomNo: z.number().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  customerId: z.string().optional(),
  createdAt: z.coerce.date().optional(),
});

export const v = {
  createBookingValidator,
  bookingIDValidator,
  updateBookingValidator,
};
