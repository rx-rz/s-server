import { z } from "zod";

const createBookingValidator = z.object({
  roomNo: z.number().int().positive(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  customerId: z.string().uuid(),
  createdAt: z.coerce.date(),
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
