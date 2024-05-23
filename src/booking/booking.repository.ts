import { eq } from "drizzle-orm";
import { ctx } from "../ctx";
import { CreateBookingRequest, UpdateBookingRequest } from "./booking.types";
import { db } from "../db/db";

const bookingTable = ctx.schema.booking;
const roomsToBookingTable = ctx.schema.roomsToBooking;
const roomsTable = ctx.schema.room;

const bookingValues = {
  id: bookingTable.id,
  customerId: bookingTable.customerId,
  startDate: bookingTable.startDate,
  endDate: bookingTable.endDate,
  createdAt: bookingTable.createdAt,
};

type bookings = {
  roomNo: number;
  id: string;
  createdAt: Date | null;
  customerId: string;
  startDate: Date;
  endDate: Date;
}[];
const createBooking = async ({
  customerId,
  endDate,
  roomNos,
  startDate,
}: CreateBookingRequest) => {
  const createdBookings = await db.transaction(async (tx) => {
    try {
      let createdBookings = [];
      for (let i = 0; i < roomNos.length; i++) {
        const [booking] = await tx
          .insert(bookingTable)
          .values({ customerId, endDate, startDate })
          .returning(bookingValues);
        const [room] = await tx
          .insert(roomsToBookingTable)
          .values({ bookingId: booking.id, roomNo: roomNos[i] })
          .returning({ roomNo: roomsToBookingTable.roomNo });
        await tx
          .update(roomsTable)
          .set({ isAvailable: false })
          .where(eq(roomsTable.roomNo, roomNos[i]));
        createdBookings.push({ ...booking, roomNo: room.roomNo });
      }
      return createdBookings;
    } catch (err) {
      console.log({error: err})
      tx.rollback();
    }
  });
  return createdBookings;
};

const updateBooking = async (request: UpdateBookingRequest) => {
  const { id, ...requestBody } = request;
  const [updatedBooking] = await ctx.db
    .update(bookingTable)
    .set(requestBody)
    .returning(bookingValues);
  return updatedBooking;
};

const getBookingDetails = async (bookingID: string) => {
  const booking = await ctx.db.query.booking.findFirst({
    where: eq(bookingTable.id, bookingID),
    with: {
      customers: true,
      roomsToBooking: true,
    },
  });
  return booking;
};

const deleteBooking = async (bookingID: string) => {
  const [deletedBooking] = await ctx.db
    .delete(bookingTable)
    .where(eq(bookingTable.id, bookingID))
    .returning(bookingValues);
  return deletedBooking;
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
};
