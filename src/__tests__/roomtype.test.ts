import { describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import { createRoute } from "../routes";

import { authenticatedTestApi } from "./setup";

const roomType1 = {
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

const roomType2 = {
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

describe("ROOM TYPE", () => {
  describe("Create room type", () => {
    const route = createRoute({
      prefix: "roomtypes",
      route: "/createRoomType",
      includeBaseURL: true,
    });
    it("should create a room type", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .post(route)
        .send(roomType1);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.roomType).toBeDefined();
    });

    it("should throw a duplicate entry error when an already existing roomtype name is used", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .post(route)
        .send(roomType1);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Duplicate Entry Error");
    });
  });

  describe("Update room type", () => {
    const route = createRoute({
      prefix: "roomtypes",
      route: "/updateRoomType",
      includeBaseURL: true,
    });

    it("should update an existing room type", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .patch(route)
        .send({
          name: roomType2.name,
          price: faker.commerce.price({ min: 10000, max: 30000 }),
        })
        .query({ name: roomType1.name });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.updatedRoomType.name).toBe(roomType2.name);
      expect(Number(response.body.updatedRoomType.price)).toBeGreaterThan(
        10000
      );
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
      // console.log({a: roomType1.name})
      // console.log(
      //   response.body.roomTypes.map(
      //     (roomTypeInList: any) => roomTypeInList.name
      //   )
      // );
      expect(
        response.body.roomTypes.map(
          (roomTypeInList: any) => roomTypeInList.name
        )
      ).toContain(roomType2.name);
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
        .query({ name: roomType2.name });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.roomTypeDetails.name).toBe(roomType2.name);
    });
  });

  describe("Get rooms for room type", () => {
    const route = createRoute({
      prefix: "roomtypes",
      route: "/getRoomsForRoomType",
    });
    it.skip("should get rooms for a provided room type", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ name: roomType2.name });
      console.log({ res: response });
      expect(response.body.isSuccess).toBe(true);
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
        .query({ name: roomType2.name });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.deletedRoomType.name).toBe(roomType2.name);
    });
  });
});
