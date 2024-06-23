import { describe, expect, it } from "vitest";
import { authenticatedTestApi, testApi } from "./setup";
import { createRoute } from "../routes";

async function getRoomTypeID() {
  const roomTypesResponse: any = await authenticatedTestApi("ADMIN").get(
    createRoute({
      prefix: "roomtypes",
      route: "/getRoomTypes",
      includeBaseURL: true,
    })
  );
  return roomTypesResponse.body.roomTypes[0].id;
}

async function getARoom(available?: boolean) {
  const roomResponse: any = await authenticatedTestApi("ADMIN")
    .get(
      createRoute({
        prefix: "rooms",
        route: "/listRooms",
        includeBaseURL: true,
      })
    )
    .query({ noOfRooms: 10 });
  console.log({ again: roomResponse.body });
  return roomResponse.body.rooms[0];
}

describe("ROOM", () => {
  describe("Create rooms", () => {
    const route = createRoute({
      prefix: "rooms",
      route: "/createRooms",
      includeBaseURL: true,
    });
    it("should create the specified number of rooms", async () => {
      const typeId = await getRoomTypeID();
      const rooms = {
        typeId: typeId,
        noOfRooms: 2,
      };
      const response = await authenticatedTestApi("ADMIN")
        .post(route)
        .send(rooms);
      console.log({ res: response.body });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toBe(
        `${rooms.noOfRooms} rooms have been created.`
      );
    });
  });
  describe("Get room details", () => {
    const route = createRoute({
      prefix: "rooms",
      route: "/getRoomDetails",
      includeBaseURL: true,
    });
    it.skip("should get room details that match a provided room number", async () => {
      const existingRoomInDB = await getARoom();
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ roomNo: existingRoomInDB.roomNo });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.room.roomNo).toBe(existingRoomInDB.roomNo);
    });
  });
  describe("Get available rooms", () => {
    const route = createRoute({
      prefix: "rooms",
      route: "/getAvailableRooms",
      includeBaseURL: true,
    });
    it("get rooms with a status of available", async () => {
      const response = await testApi.get(route);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.availableRooms[0].rooms.status).toBe("available");
    });
  });

  // describe("List rooms" )
  describe("Update a room", () => {
    const route = createRoute({
      prefix: "rooms",
      route: "/updateRoom",
      includeBaseURL: true,
    });
    it.skip("should update a room with the specified values", async () => {
      const existingRoomInDB = await getARoom();
      const response = await authenticatedTestApi("ADMIN").patch(route).send({
        roomNo: existingRoomInDB.roomNo,
        status: "booked",
      });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.roomUpdated.status).toBe("booked");
    });
  });
  describe("Delete a room", () => {
    const route = createRoute({
      prefix: "rooms",
      route: "/deleteRoom",
      includeBaseURL: true,
    });
    it.skip("should delete a room with the specified room number", async () => {
      const existingRoomInDB = await getARoom();
      const response = await authenticatedTestApi("ADMIN").delete(route).query({
        roomNo: existingRoomInDB.roomNo,
      });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.roomDeleted.roomNo).toBe(existingRoomInDB.roomNo);
    });
  });
});
