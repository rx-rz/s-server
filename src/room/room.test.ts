import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { faker } from "@faker-js/faker";
import { startTestServer, stopTestServer } from "../setup-tests";
import { httpstatus } from "../ctx";

beforeAll(async () => {
  await startTestServer(4001);
});
afterAll(async () => {
  await stopTestServer();
});
const roomCreationObject = {
  typeId: 2,
  noOfRooms: 2,
};
describe("POST /rooms/createRoom", () => {
  const route = "/api/v1/rooms/createRooms";
  it("should create the right number of rooms", async () => {
    const response = await request(app).post(route).send(roomCreationObject);

    expect(response.body.isSuccess).toBe(true);
    expect(response.body.message).toBe(
      `${roomCreationObject.noOfRooms} rooms have been created.`
    );
  });

  it("should throw an error for an inexistent room ID", async () => {
    const response = await request(app)
      .post(route)
      .send({ ...roomCreationObject, typeId: 1000000 });
    expect(response.statusCode).toBe(500);
  });
});

describe("/GET /rooms/roomDetails", () => {
  const route = "/api/v1/rooms/roomDetails";

  it("should get room details", async () => {
    const availableRoomsResponse = await request(app).get(
      "/api/v1/rooms/listRooms"
    );
    const availableRooms = availableRoomsResponse.body.rooms.map(
      (room: any) => room.roomNo
    );
    const response = await request(app)
      .get(route)
      .query({ roomNo: availableRooms[0] });
    expect(response.body.isSuccess).toBe(true);
  });

  it("should throw an error for an inexistent room", async () => {
    const availableRoomsResponse = await request(app).get(
      "/api/v1/rooms/listRooms"
    );
    const availableRooms = availableRoomsResponse.body.rooms.map(
      (room: any) => room.roomNo
    );
    const response = await request(app)
      .get(route)
      .query({ roomNo: availableRooms[availableRooms.length + 1] });
    expect(response.body.isSuccess).toBe(false);
  });
});

describe("/GET /rooms/listRooms", () => {
  const route = "/api/v1/rooms/listRooms";
  it("should get a list of rooms", async () => {
    const response = await request(app).get(route);
    expect(response.body.isSuccess).toBe(true);
  });
});

describe("/PATCH /rooms/updateRoom", () => {
  const route = "/api/v1/rooms/updateRoom";

  it("should update a room", async () => {
    const roomTypesResponse = await request(app).get(
      "/api/v1/roomtypes/getRoomTypes"
    );
    const typeIDs = roomTypesResponse.body.roomTypes.map(
      (type: any) => type.id
    );
    const availableRoomsResponse = await request(app).get(
      "/api/v1/rooms/listRooms"
    );
    const availableRooms = availableRoomsResponse.body.rooms.map(
      (room: any) => room.roomNo
    );
    const response = await request(app)
      .patch(route)
      .send({
        typeId: typeIDs[0],
        roomNo: availableRooms.length + 1,
      });
    expect(response.body.isSuccess).toBe(true);
  });

  it("should throw errors for an inexistent room", async () => {
    const roomTypesResponse = await request(app).get(
      "/api/v1/roomtypes/getRoomTypes"
    );
    const typeIDs = roomTypesResponse.body.roomTypes.map(
      (type: any) => type.id
    );
    const availableRoomsResponse = await request(app).get(
      "/api/v1/rooms/listRooms"
    );
    const availableRooms = availableRoomsResponse.body.rooms.map(
      (room: any) => room.roomNo
    );
    const response = await request(app)
      .patch(route)
      .send({
        typeId: typeIDs[typeIDs.length - 1] + 1,
        roomNo: availableRooms.length + 1,
      });
    expect(response.body.isSuccess).toBe(false);
    expect(response.statusCode).toBe(httpstatus.NOT_FOUND);
  });
});

describe("/DELETE /rooms/deleteRoom", () => {
  const route = "/api/v1/rooms/deleteRoom";
  it("should delete a room", async () => {
    const availableRoomsResponse = await request(app).get(
      "/api/v1/rooms/listRooms"
    );
    const availableRooms = availableRoomsResponse.body.rooms.map(
      (room: any) => room.roomNo
    );
    const response = await request(app)
      .delete(route)
      .query({ roomNo: availableRooms[availableRooms.length - 1] });
    expect(response.body.isSuccess).toBe(true);
  });
  it("should throw a not found error for a just deleted room", async () => {
    const availableRoomsResponse = await request(app).get(
      "/api/v1/rooms/listRooms"
    );
    const availableRooms = availableRoomsResponse.body.rooms.map(
      (room: any) => room.roomNo
    );

    const response = await request(app)
      .delete(route)
      .query({ roomNo: availableRooms[availableRooms.length - 1] + 10000000 });
    expect(response.body.isSuccess).toBe(false);
    expect(response.statusCode).toBe(httpstatus.NOT_FOUND);
  });
});
