import { SQLWrapper, and, asc, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { ctx } from "../ctx";
import {
  Booking,
  Bookings,
  CreateBookingRequest,
  ListBookingParams,
  Search,
  UpdateBookingRequest,
} from "./booking.types";
const bookingTable = ctx.schema.booking;

const bookingValues = {
  id: bookingTable.id,
  customerId: bookingTable.customerId,
  startDate: bookingTable.startDate,
  endDate: bookingTable.endDate,
  status: bookingTable.status,
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

function getBookingsForEachMonth(bookings: Booking[]) {
  const monthArray = [];
  const monthCounts: { [key: string]: number } = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0,
  };

  for (const booking of bookings) {
    const bookingDate = new Date(booking.createdAt!);
    const monthName = bookingDate.toLocaleString("default", { month: "short" });
    monthCounts[monthName]++;
  }

  for (let i = 0; i < Object.keys(monthCounts).length; i++) {
    monthArray.push({
      name: Object.keys(monthCounts)[i],
      value: Object.values(monthCounts)[i],
    });
  }

  return monthArray;
}
const getBookingsForAdminDashboard = async () => {
  let date = new Date(Date.now());
  date.setFullYear(date.getFullYear() - 1);
  const bookings = await ctx.db
    .select(bookingValues)
    .from(bookingTable)
    .where(gte(bookingTable.createdAt, date.toISOString()));
  const bookingsPerMonth = getBookingsForEachMonth(bookings);
  return bookingsPerMonth;
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
  return deletedBooking
};
const bookingListSearch = (search: Search) => {
  let filterQueries: SQLWrapper[] = [];
  for (let i of search) {
    switch (i.key) {
      case "roomNo":
        filterQueries.push(eq(bookingTable.roomNo, Number(i.value)));
      case "status":
        filterQueries.push(
          eq(
            bookingTable.status,
            i.value as "pending" | "active" | "cancelled" | "done"
          )
        );
      case "customerId":
        filterQueries.push(eq(bookingTable.customerId, i.value.toString()));
      case "amount":
        filterQueries.push(eq(bookingTable.amount, i.value.toString()));
      case "id":
        filterQueries.push(ilike(bookingTable.id, `%${i.value.toString()}%`));
      case "endDate":
        filterQueries.push(lte(bookingTable.endDate, i.value.toString()));
      default:
        filterQueries.push(gte(bookingTable[i.key], i.value));
    }
  }
  return filterQueries;
};
const listBookings = async ({
  limit,
  pageNo,
  orderBy,
  ascOrDesc,
  searchBy,
}: ListBookingParams) => {
  let bookings;
  const dbQuery = ctx.db.select(bookingValues).from(bookingTable);
  if (searchBy) {
    const filterQueries = bookingListSearch(searchBy);
    bookings = await dbQuery.where(and(...filterQueries));
  }
  const bookingList = await dbQuery;
  bookings = await dbQuery
    .limit(limit)
    .offset((pageNo - 1) * limit)
    .orderBy(
      ascOrDesc === "asc"
        ? asc(bookingTable[`${orderBy}`])
        : desc(bookingTable[`${orderBy}`])
    );
  return { bookings, noOfBookings: bookingList.length };
};

export const bookingRepository = {
  deleteBooking,
  updateBooking,
  createBooking,
  getBookingDetails,
  listBookings,
  getExpiredBookings,
  getBookingsForAdminDashboard,
};
