import { describe, expect, it } from "vitest";
import { createRoute } from "../routes";
import { authenticatedTestApi, testApi } from "./setup";
import { getNoOfDays } from "../booking/booking.helpers";
import { getABooking, getAvailableRoom, getCustomer } from "./test-helpers";



const date = new Date();

describe("BOOKING", () => {
  describe("Make a booking", () => {
    const route = createRoute({
      prefix: "bookings",
      route: "/createBooking",
      includeBaseURL: true,
    });
    it("should create a booking", async () => {
      const customer = await getCustomer();
      const availableRoom = await getAvailableRoom();
      const [startDate, endDate] = [
        date.toISOString(),
        //add an extra day to get the end date
        new Date(date.setDate(date.getDate() + 1)).toISOString(),
      ];
      const noOfDays = getNoOfDays({
        startDate,
        endDate,
      });
      const booking1 = {
        customerId: customer.id,
        roomNo: availableRoom.rooms.roomNo,
        startDate,
        endDate,
        amount: noOfDays * Number(availableRoom.room_types.price),
      };
      const response = await authenticatedTestApi("CUSTOMER")
        .post(route)
        .send(booking1);
      expect(response.body.isSuccess).toBe(true);
    });
  });

  describe("Update a booking", () => {
    const route = createRoute({
      prefix: "bookings",
      route: "/updateBooking",
      includeBaseURL: true,
    });
    it("should update a booking", async () => {
      const existingBookingInDB = await getABooking();
      const response = await authenticatedTestApi("ADMIN")
        .patch(route)
        .send({
          id: existingBookingInDB.id,
          endDate: new Date(date.setDate(date.getDate() + 2)).toISOString(),
        });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.bookingUpdated.id).toBe(existingBookingInDB.id);
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
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.booking.id).toBe(existingBookingInDB.id)
    });
  });

  describe("List bookings", () => {
    const route = createRoute({
      prefix: "bookings",
      route: "/listBookings",
      includeBaseURL: true
    })
    it("should list bookings", async () => {
      const response =await authenticatedTestApi("ADMIN").get(route)
      console.log({b: response.body.bookings})
      expect(response.body.isSuccess).toBe(true)
      expect(response.body.bookings).toBeDefined()
    })
  })
});
