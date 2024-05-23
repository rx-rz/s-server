import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../app";
import request from "supertest";
import { Room } from "../room/room.types";
import { startTestServer, stopTestServer } from "../setup-tests";
import { httpstatus } from "../ctx";

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

async function getUnavailableRoom() {
  const roomsResponse = await request(app).get("/api/v1/rooms/listRooms");
  const unavailableRoom = roomsResponse.body.rooms.find(
    (room: Room) => room.isAvailable === false
  );

  return unavailableRoom.roomNo;
}
beforeAll(async () => {
  await startTestServer(4112);
});

afterAll(async () => {
  await stopTestServer();
});

describe("/POST /bookings/createBooking", () => {
  const route = "/api/v1/bookings/createBooking";

  it("should create a booking", async () => {
    const testBooking = await getTestBooking();
    const response = await request(app).post(route).send(testBooking);
    expect(response.body.isSuccess).toBe(true);
  });

  it("should throw a duplicate entry error for an unavailable room", async () => {
    const testBooking = await getTestBooking();
    const unavailableRoom = await getUnavailableRoom();
    const response = await request(app)
      .post(route)
      .send({ ...testBooking, roomNos: [unavailableRoom] });
    expect(response.body.isSuccess).toBe(false);
    expect(response.statusCode).toBe(httpstatus.CONFLICT);
  });

  
});
