import { eq, lte } from "drizzle-orm";
import { ctx } from "../ctx";
import {
  Bookings,
  CreateBookingRequest,
  UpdateBookingRequest,
} from "./booking.types";
const bookingTable = ctx.schema.booking;

const bookingValues = {
  id: bookingTable.id,
  customerId: bookingTable.customerId,
  startDate: bookingTable.startDate,
  endDate: bookingTable.endDate,
  status: bookingTable.status,
  paymentStatus: bookingTable.paymentStatus,
  createdAt: bookingTable.createdAt,
  roomNo: bookingTable.roomNo,
  amount: bookingTable.amount,
};

const createBooking = async ({
  customerId,
  endDate,
  roomNo,
  startDate,
  amount,
}: CreateBookingRequest) => {
  const [booking] = await ctx.db
    .insert(bookingTable)
    .values({ customerId, endDate, startDate, amount, roomNo })
    .returning(bookingValues);
  return { booking };
};

const updateBooking = async (request: UpdateBookingRequest) => {
  const { id, ...requestBody } = request;
  const [booking] = await ctx.db
    .update(bookingTable)
    .set(requestBody)
    .where(eq(bookingTable.id, id))
    .returning(bookingValues);
  return { booking };
};

const getExpiredBookings = async () => {
  const date = new Date();
  const bookings = await ctx.db.query.booking.findMany({
    where: lte(bookingTable.endDate, date.toISOString()),
    with: {
      room: true,
    },
  });
  return bookings;
};

const getBookingDetails = async (bookingID: string) => {
  const booking = await ctx.db.query.booking.findFirst({
    where: eq(bookingTable.id, bookingID),
    with: {
      customers: {
        columns: {
          email: true,
          firstName: true,
          lastName: true,
          id: true,
        },
      },
      room: true,
    },
  });
  return booking;
};

const deleteBooking = async (bookingID: string) => {
  const deletedBooking = await ctx.db
    .delete(bookingTable)
    .where(eq(bookingTable.id, bookingID));
};

const listBookings = async () => {
  const bookings = await ctx.db.select(bookingValues).from(bookingTable);
  return bookings;
};

export const bookingRepository = {
  deleteBooking,
  updateBooking,
  createBooking,
  getBookingDetails,
  listBookings,
  getExpiredBookings,
};
