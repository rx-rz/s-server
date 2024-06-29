import { describe, expect, it } from "vitest";
import { authenticatedTestApi, testApi } from "./setup";
import { createRoute } from "../routes";
import { getARoom, getRoomTypeID } from "./test-helpers";
import {
  CreateRoomResponse,
  GetAvailableRoomsResponse,
  GetRoomDetailsResponse,
} from "../room/room.types";

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
      const responseBody: CreateRoomResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.message).toBeDefined();
    });

    it("should throw  a not found error when an existent room type ID is provided.", async () => {
      const rooms = {
        typeId: 1_000_000_000,
        noOfRooms: 2,
      };
      const response = await authenticatedTestApi("ADMIN")
        .post(route)
        .send(rooms);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("Get room details", () => {
    const route = createRoute({
      prefix: "rooms",
      route: "/getRoomDetails",
      includeBaseURL: true,
    });
    it("should get room details that match a provided room number", async () => {
      const existingRoomInDB = await getARoom();
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ roomNo: existingRoomInDB.roomNo });
      const responseBody: GetRoomDetailsResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.rooms.roomNo).toBe(existingRoomInDB.roomNo);
    });

    it("should throw a not found error for when an inexistent room number is provided", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ roomNo: 1_000_000_000 });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
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
      const responseBody: GetAvailableRoomsResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(
        responseBody.availableRooms.every(
          (availableRoom) => availableRoom.rooms.status === "available"
        )
      ).toBe(true);
    });
  });

  describe("Update a room", () => {
    const route = createRoute({
      prefix: "rooms",
      route: "/updateRoom",
      includeBaseURL: true,
    });
    it("should update a room with the specified values", async () => {
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
