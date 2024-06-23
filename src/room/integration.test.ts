import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createRoute } from "../routes";
import request from "supertest";
import { app } from "../app";
import { startTestServer, stopTestServer } from "../setup-tests";
import { testServerPorts } from "../lib/test-server-ports";
import { faker } from "@faker-js/faker";

beforeAll(async () => {
  await startTestServer(testServerPorts.room);
});

afterAll(async () => {
  await stopTestServer();
});

const testApi = request.agent(app);

const getRoomTypeID = async () => {
  const roomTypes: any = await testApi.get(
    createRoute({
      prefix: "roomtypes",
      route: "/getRoomTypes",
    })
  );
  console.log({roomTypes})
  return roomTypes[0].id;
};

describe("ROOM", () => {

  describe("Create a room", () => {
    const route = createRoute({
      prefix: "rooms",
      route: "/createRooms",
      includeBaseURL: true,
    });
    it("should create a room", async () => {
      const response = await testApi
        .post(route)
        .send({ noOfRooms: 2, typeId: getRoomTypeID() });
      expect(response.body.isSuccess).toBe(true);
    });
  });
});
