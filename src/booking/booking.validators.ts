import { z } from "zod";

const currentTimestamp = new Date().toISOString();

const createBookingValidator = z
  .object({
    roomNo: z.number(),
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

const listBookingValidator = z.object({
  pageNo: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  ascOrDesc: z.enum(["asc", "desc"]).default("desc"),
  searchBy: z
    .array(
      z.object({
        key: z.enum([
          "id",
          "createdAt",
          "amount",
          "customerEmail",
          "startDate",
          "endDate",
          "status",
          "roomNo",
        ]),
        value: z.union([z.number(), z.string()]),
      })
    )
    .optional(),
  orderBy: z
    .enum([
      "customerEmail",
      "id",
      "createdAt",
      "amount",
      "startDate",
      "endDate",
      "status",
      "roomNo",
    ])
    .default("createdAt"),
});

export type Booking = {
  id: string;
  createdAt: string | null;
  customerId: string;
  amount: string;
  startDate: string;
  endDate: string;
  status: "active" | "cancelled" | "done" | "pending";
  paymentStatus: "pending" | "confirmed";
  roomNo: number;
};
export const v = {
  createBookingValidator,
  bookingIDValidator,
  listBookingValidator,
  updateBookingValidator,
};
