import { eq, lte } from "drizzle-orm";
import { ctx } from "../ctx";
import {
  Bookings,
  CreateBookingRequest,
  UpdateBookingRequest,
} from "./booking.types";
import { db } from "../db/db";

const bookingTable = ctx.schema.booking;
const roomsToBookingTable = ctx.schema.roomsToBooking;
const roomsTable = ctx.schema.room;
const bookingValues = {
  id: bookingTable.id,
  customerId: bookingTable.customerId,
  startDate: bookingTable.startDate,
  endDate: bookingTable.endDate,
  status: bookingTable.status,
  paymentStatus: bookingTable.paymentStatus,
  createdAt: bookingTable.createdAt,
  amount: bookingTable.amount,
};

const createBooking = async ({
  customerId,
  endDate,
  roomNos,
  startDate,
  amount,
}: CreateBookingRequest) => {
  const createdBookings = await db.transaction(async (tx) => {
    try {
      let roomsBooked = [];
      const [booking] = await tx
        .insert(bookingTable)
        .values({ customerId, endDate, startDate, amount })
        .returning(bookingValues);
      for (let i = 0; i < roomNos.length; i++) {
        await tx
          .insert(roomsToBookingTable)
          .values({ bookingId: booking.id, roomNo: roomNos[i] })
          .returning({ roomNo: roomsToBookingTable.roomNo });
        const [room] = await tx
          .update(roomsTable)
          .set({ status: "pending" })
          .where(eq(roomsTable.roomNo, roomNos[i]))
          .returning({
            roomNo: roomsTable.roomNo,
            roomType: roomsTable.typeId,
          });
        roomsBooked.push(room);
      }
      return { booking, roomsBooked };
    } catch (err) {
      console.log({ error: err });
      tx.rollback();
    }
  });
  return createdBookings;
};

const updateBooking = async (request: UpdateBookingRequest) => {
  const bookingsUpdated = await db.transaction(async (tx) => {
    let roomsBooked = [];
    try {
      const { id, roomNos, ...requestBody } = request;
      const [booking] = await tx
        .update(bookingTable)
        .set(requestBody)
        .where(eq(bookingTable.id, id))
        .returning(bookingValues);
      if (roomNos) {
        for (let i = 0; i < roomNos.length; i++) {
          await tx
            .delete(roomsToBookingTable)
            .where(eq(roomsToBookingTable.bookingId, id));
          await tx
            .insert(roomsToBookingTable)
            .values({ bookingId: booking.id, roomNo: roomNos[i] })
            .returning({ roomNo: roomsToBookingTable.roomNo });
          const [room] = await tx
            .update(roomsTable)
            .set({ status: "pending" })
            .where(eq(roomsTable.roomNo, roomNos[i]))
            .returning({
              roomNo: roomsTable.roomNo,
              roomType: roomsTable.typeId,
            });
          roomsBooked.push(room);
        }
      }
      return { booking, roomsBooked };
    } catch (err) {
      console.log(err);
      tx.rollback();
    }
  });
  return bookingsUpdated;
};

const getExpiredBookings = async () => {
  const date = new Date();
  const bookings = await ctx.db.query.booking.findMany({
    where: lte(bookingTable.endDate, date.toISOString()),
    with: {
      roomsToBooking: true,
    },
  });
  return bookings;
};

const updateBookingStatusesToDone = async (bookings: Bookings) => {
  await ctx.db.transaction(async (tx) => {
    try {
      for (let i = 0; bookings.length; i++) {
        await tx
          .update(bookingTable)
          .set({ status: "done" })
          .where(eq(bookingTable.id, bookings[i].id));
        let roomsBooked = bookings[i].roomsToBooking;
        for (let j = 0; j < roomsBooked.length; j++) {
          await tx
            .delete(roomsToBookingTable)
            .where(eq(roomsToBookingTable.roomNo, roomsBooked[i].roomNo));
          await tx
            .update(roomsTable)
            .set({ status: "available" })
            .where(eq(roomsTable.roomNo, roomsBooked[i].roomNo));
        }
      }
    } catch (err) {
      tx.rollback();
    }
  });
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
  const deletedBooking = await db.transaction(async (tx) => {
    const roomsAssociatedWithDeletedBooking = await tx
      .delete(roomsToBookingTable)
      .where(eq(roomsToBookingTable.bookingId, bookingID))
      .returning({
        roomNo: roomsToBookingTable.roomNo,
      });
    for (let i = 0; i < roomsAssociatedWithDeletedBooking.length; i++) {
      await tx
        .update(roomsTable)
        .set({ status: "available" })
        .where(
          eq(roomsTable.roomNo, roomsAssociatedWithDeletedBooking[i].roomNo)
        );
    }
    const [booking] = await tx
      .delete(bookingTable)
      .where(eq(bookingTable.id, bookingID))
      .returning(bookingValues);
    return booking;
  });
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
  getExpiredBookings,
  updateBookingStatusesToDone,
};
