import { beforeAll, describe, expect, it } from "vitest";
import { createRoute } from "../routes";
import { authenticatedTestApi, testApi } from "./setup";
import { getNoOfDays } from "../booking/booking.helpers";
import { getABooking, getAvailableRoom, getCustomer } from "./test-helpers";
import {
  Booking,
  CreateBookingResponse,
  GetBookingDetailsResponse,
  ListBookingsResponse,
  UpdateBookingResponse,
} from "../types/booking.types";
import { Customer } from "../types/customer.types";
import { faker } from "@faker-js/faker";
import { Room } from "../types/room.types";
import qs from "qs";
const date = new Date();
type BookingCreationObject = {
  customerEmail: string;
  roomNo: number;
  startDate: string;
  endDate: string;
  amount: number;
};

let testBooking: BookingCreationObject;

describe("BOOKING", () => {
  describe("Make a booking", () => {
    const route = createRoute({
      prefix: "bookings",
      route: "/createBooking",
      includeBaseURL: true,
    });
    let room: Room;
    let customer: Customer;
    const [startDate, endDate] = [
      date.toISOString(),
      //add an extra day to get the end date
      new Date(date.setDate(date.getDate() + 1)).toISOString(),
    ];
    const noOfDays = getNoOfDays({
      startDate,
      endDate,
    });
    beforeAll(async () => {
      room = await getAvailableRoom();
      customer = await getCustomer();
    });

    it("should create a booking", async () => {
      const booking = {
        customerEmail: customer.email,
        roomNo: room.roomNo,
        startDate,
        endDate,
        amount: noOfDays * Number(room?.price),
      };
      const response = await testApi.post(route).send(booking);
      const responseBody: CreateBookingResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.bookingCreated.status).toBe("pending");
    });

    it("should throw a duplicate entry error for a room that has already been booked", async () => {
      const booking = {
        customerEmail: customer.email,
        roomNo: room.roomNo,
        startDate,
        endDate,
        amount: noOfDays * Number(room?.price),
      };
      const response = await testApi.post(route).send(booking);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Duplicate Entry Error");
    });

    it("it should throw an invalid input error when the provided booking price is not correct", async () => {
      const room = await getAvailableRoom()
      const booking = {
        customerEmail: customer.email,
        roomNo: room.roomNo,
        startDate,
        endDate,
        amount: noOfDays * Number(room?.price) * 10,
      };
      const response = await testApi.post(route).send(booking);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Invalid Input Error");
    });
  });

  // describe("Update booking and payment status", async () => {
  //   const route = createRoute({
  //     prefix: "bookings",
  //     route: "/updateBookingPaymentStatus"
  //   })
  // })

  describe("Update a booking", () => {
    const route = createRoute({
      prefix: "bookings",
      route: "/updateBooking",
      includeBaseURL: true,
    });
    let existingBookingInDB: Booking;
    beforeAll(async () => {
      existingBookingInDB = await getABooking();
    });

    it("should update a booking", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .patch(route)
        .send({
          id: existingBookingInDB.id,
          endDate: new Date(date.setDate(date.getDate() + 2)).toISOString(),
        });
      const responseBody: UpdateBookingResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.bookingUpdated.id).toBe(existingBookingInDB.id);
    });

    it("should throw an error if an inexistent booking ID is provided", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .patch(route)
        .send({
          id: faker.string.uuid(),
          endDate: new Date(date.setDate(date.getDate() + 2)).toISOString(),
        });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("Get booking details", () => {
    const route = createRoute({
      prefix: "bookings",
      route: "/bookingDetails",
      includeBaseURL: true,
    });
    it("gets a booking and its specified details", async () => {
      const existingBookingInDB = await getABooking();
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ id: existingBookingInDB.id });
      const responseBody: GetBookingDetailsResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.booking.id).toBe(existingBookingInDB.id);
    });

    it("throws a not found error if an inexistent booking is provided", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ id: faker.string.uuid() });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("List bookings", () => {
    const route = createRoute({
      prefix: "bookings",
      route: "/listBookings",
      includeBaseURL: true,
    });
    it("should list bookings", async () => {
      const response = await authenticatedTestApi("ADMIN").get(route);
      const responseBody: ListBookingsResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(Array.isArray(responseBody.bookings)).toBe(true);
    });

    it("should filter bookings by id correctly", async () => {
      const existingBookingInDB = await getABooking();
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query(
          qs.stringify({
            searchBy: [
              {
                key: "id",
                value: existingBookingInDB.id,
              },
            ],
          })
        );
      const responseBody: ListBookingsResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.bookings[0].id).toBe(existingBookingInDB.id);
    });

    it("should filter bookings by specified search queries correctly", async () => {
      const existingBookingInDB = await getABooking();
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query(
          qs.stringify({
            searchBy: [
              {
                key: "status",
                value: existingBookingInDB.status,
              },
              {
                key: "roomNo",
                value: existingBookingInDB.roomNo,
              },
              {
                key: "amount",
                value: existingBookingInDB.amount,
              },
            ],
          })
        );
      const responseBody: ListBookingsResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.bookings[0].status).toBe(existingBookingInDB.status);
      expect(responseBody.bookings[0].roomNo).toBe(existingBookingInDB.roomNo);
      expect(responseBody.bookings[0].amount).toBe(existingBookingInDB.amount);
    });

    it("should handle pagination correctly", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ limit: 5 });
      const responseBody: ListBookingsResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.bookings.length).toBeLessThanOrEqual(5);
    });
    it("should handle invalid query parameters", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ limit: "akhi" });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Validation Error");
    });
  });
});
