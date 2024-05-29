import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../app";
import request from "supertest";
import { Room } from "../room/room.types";
import { startTestServer, stopTestServer } from "../setup-tests";
import { httpstatus } from "../ctx";
import { faker } from "@faker-js/faker";

beforeAll(async () => {
  await startTestServer(4112);
});

afterAll(async () => {
  await stopTestServer();
});

async function getTestBooking() {
  const roomsResponse = await request(app).get("/api/v1/rooms/listRooms");
  const customerResponse = await request(app).get(
    "/api/v1/customers/listCustomers"
  );
  const availableCustomer = customerResponse.body.customers[0];
  const availableRooms = roomsResponse.body.rooms
    .filter((room: Room) => room.isAvailable === true)
    .map((room: Room) => room.roomNo);
  return {
    roomNos: [availableRooms[0]],
    startDate: new Date().toISOString(),
    endDate: "2024-05-28T10:00:00.000Z",
    customerId: availableCustomer.id,
  };
}

async function getAvailableBookingID() {
  const bookingsResponse = await request(app).get(
    "/api/v1/bookings/listBookings"
  );
  const bookingID = bookingsResponse.body.bookings[0]["id"];
  return bookingID;
}

async function getRooms({
  unavailableRooms = false,
}: {
  unavailableRooms?: boolean;
}) {
  const roomsResponse = await request(app).get("/api/v1/rooms/listRooms");
  const unavailableRoom = roomsResponse.body.rooms.find((room: Room) =>
    room.isAvailable === unavailableRooms ? false : true
  );
  return unavailableRoom.roomNo;
}

describe("/POST /bookings/createBooking", () => {
  const route = "/api/v1/bookings/createBooking";

  it("should create a booking", async () => {
    const testBooking = await getTestBooking();
    const response = await request(app).post(route).send(testBooking);
    expect(response.body.isSuccess).toBe(true);
  });

  it("should throw a duplicate entry error for an unavailable room", async () => {
    const testBooking = await getTestBooking();
    const unavailableRoom = await getRooms({ unavailableRooms: true });
    const response = await request(app)
      .post(route)
      .send({ ...testBooking, roomNos: [unavailableRoom] });
    expect(response.body.isSuccess).toBe(false);
    expect(response.statusCode).toBe(httpstatus.CONFLICT);
  });
});

describe("PATCH /bookings/updateBooking", () => {
  const route = "/api/v1/bookings/updateBooking";

  it("should update a booking", async () => {
    const bookingID = await getAvailableBookingID();
    const testBooking = await getTestBooking();
    const room = await getRooms({});
    const response = await request(app)
      .patch(route)
      .send({ ...testBooking, id: bookingID, roomNos: [room] });
    expect(response.body.isSuccess).toBe(true);
  });
});

describe("/DELETE /bookings/deleteBooking", () => {
  const route = "/api/v1/bookings/deleteBooking";

  it("should delete a booking", async () => {
    const bookingID = await getAvailableBookingID();
    const response = await request(app).delete(route).query({ id: bookingID });
    expect(response.body.isSuccess).toBe(true);
  });
});

describe("/GET /bookings/bookingDetails", () => {
  const route = "/api/v1/bookings/bookingDetails";
  it("should get details about bookings", async () => {
    const bookingID = await getAvailableBookingID();
    const response = await request(app).get(route).query({ id: bookingID });
    expect(response.body.isSuccess).toBe(true);
  });

  it("should throw a not found error for an inexistent booking", async () => {
    const bookingID = faker.string.uuid();
    const response = await request(app).get(route).query({ id: bookingID });
    expect(response.body.isSuccess).toBe(false);
    expect(response.statusCode).toBe(httpstatus.NOT_FOUND);
  });
});

describe("/GET /bookings/listBookings", () => {
  it("should fetch a list of bookings", async () => {
    const route = "/api/v1/bookings/listBookings";
    const response = await request(app).get(route);
    expect(response.body.isSuccess).toBe(true);
  });
});
