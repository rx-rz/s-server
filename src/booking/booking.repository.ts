import { eq } from "drizzle-orm";
import { ctx } from "../ctx";
import { NotFoundError } from "../errors";
import { CreateBookingRequest, UpdateBookingRequest } from "./booking.types";

const bookingTable = ctx.schema.booking;
const bookingValues = {
  id: bookingTable.id,
  customerId: bookingTable.customerId,
  startDate: bookingTable.startDate,
  endDate: bookingTable.endDate,
  createdAt: bookingTable.createdAt,
};

const createBooking = async (request: CreateBookingRequest) => {
  const [booking] = await ctx.db
    .insert(bookingTable)
    .values(request)
    .returning(bookingValues);
  return booking;
};

const updateBooking = async (request: UpdateBookingRequest) => {
  const { id, ...requestBody } = request;
  await getBookingDetails(id);
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
    }
  })
  if (!booking) {
    throw new NotFoundError(`Booking with ID ${bookingID} could not be found.`);
  }
  return booking;
};

const deleteBooking = async (bookingID: string) => {
  await getBookingDetails(bookingID);
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
