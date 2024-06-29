import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { faker } from "@faker-js/faker";
import { createRoute } from "../routes";

import { authenticatedTestApi } from "./setup";
import {
  CreateRoomTypeResponse,
  GetRoomTypesResponse,
  GetRoomsForRoomTypeResponse,
  UpdateRoomTypeResponse,
} from "../types/roomtype.types";

type RoomTypeCreationObject = {
  description: string;
  features: string[];
  name: string;
  price: string;
};
let testRoomType: RoomTypeCreationObject;

describe("ROOM TYPE", () => {
  describe("Create room type", () => {
    const route = createRoute({
      prefix: "roomtypes",
      route: "/createRoomType",
      includeBaseURL: true,
    });
    const newRoomType = {
      description: faker.lorem.paragraphs(2),
      features: [
        faker.commerce.productDescription(),
        faker.commerce.productDescription(),
        faker.commerce.productDescription(),
        faker.commerce.productDescription(),
      ],
      name: faker.word.noun(),
      price: faker.commerce.price({ min: 10000, max: 30000 }),
    };
    it("should create a room type", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .post(route)
        .send(newRoomType);
      const responseBody: CreateRoomTypeResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.roomType).toBeDefined();
    });

    it("should throw a duplicate entry error when an already existing roomtype name is used", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .post(route)
        .send(newRoomType);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Duplicate Entry Error");
    });
  });

  beforeEach(async () => {
    testRoomType = {
      description: faker.lorem.paragraphs(2),
      features: [
        faker.commerce.productDescription(),
        faker.commerce.productDescription(),
        faker.commerce.productDescription(),
        faker.commerce.productDescription(),
      ],
      name: faker.word.noun(),
      price: faker.commerce.price({ min: 10000, max: 30000 }),
    };
    await authenticatedTestApi("ADMIN")
      .post(
        createRoute({
          prefix: "roomtypes",
          route: "/createRoomType",
          includeBaseURL: true,
        })
      )
      .send(testRoomType);
  });

  afterEach(async () => {
    await authenticatedTestApi("ADMIN")
      .delete(
        createRoute({
          prefix: "roomtypes",
          route: "/loginCustomer",
          includeBaseURL: true,
        })
      )
      .query({ name: testRoomType.name });
  });

  describe("Update room type", () => {
    const route = createRoute({
      prefix: "roomtypes",
      route: "/updateRoomType",
      includeBaseURL: true,
    });
    const [name, price] = [
      faker.word.noun(),
      faker.commerce.price({ min: 10000, max: 30000 }),
    ];
    it("should update an existing room type", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .patch(route)
        .send({
          name,
          price,
        })
        .query({ name: testRoomType.name });
      const responseBody: UpdateRoomTypeResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.updatedRoomType.name).toBe(name);
      expect(Number(responseBody.updatedRoomType.price)).toBeGreaterThan(10000);
    });

    it("should throw a Not Found Error for an inexistent room type", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .patch(route)
        .send({ name: faker.word.noun(), price })
        .query({ name: "Inexistent Room Type" });
      console.log({ ERROR: response.body });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("Get room types", () => {
    const route = createRoute({
      prefix: "roomtypes",
      route: "/getRoomTypes",
      includeBaseURL: true,
    });
    it("should get available room types", async () => {
      const response = await authenticatedTestApi("ADMIN").get(route);
      const responseBody: GetRoomTypesResponse = response.body;
      expect(
        responseBody.roomTypes.find(
          (roomTypeInList) => roomTypeInList.name === testRoomType.name
        )
      ).toBeDefined();
    });
  });

  describe("Get rooms for room type", () => {
    const route = createRoute({
      prefix: "roomtypes",
      route: "/getRoomsForRoomType",
      includeBaseURL: true,
    });
    it("should get rooms available for a particular room type", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ name: testRoomType.name });
      const responseBody: GetRoomsForRoomTypeResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.roomsForRoomType.name).toBe(testRoomType.name);
    });

    it("should throw a not found error for an inexistent room type", async () => {
        const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ name: "Inexistent Room Type" });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });



  describe("Get room type details", () => {
    const route = createRoute({
      prefix: "roomtypes",
      route: "/roomTypeDetails",
      includeBaseURL: true,
    });

    it("should get room type details for a particular room", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ name: testRoomType.name });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.roomTypeDetails.name).toBe(testRoomType.name);
    });

    it("should throw a Not Found Error for an inexistent room type", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ name: "Inexistent Room Type" });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("Delete room type", () => {
    const route = createRoute({
      prefix: "roomtypes",
      route: "/deleteRoomType",
      includeBaseURL: true,
    });
    it("delete a room type", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .delete(route)
        .query({ name: testRoomType.name });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.deletedRoomType.name).toBe(testRoomType.name);
    });

    it("should throw a Not Found Error for an inexistent room type", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .delete(route)
        .query({ name: "Inexistent Room Type" });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });


});
