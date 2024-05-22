import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { CreateRoomTypeRequest, UpdateRoomTypeRequest } from "./roomtype.types";
import { faker } from "@faker-js/faker";
import { httpstatus } from "../ctx";
import { startTestServer, stopTestServer } from "../setup-tests";

const initialRoomType: CreateRoomTypeRequest = {
  description: faker.lorem.paragraphs(2),
  features: [
    faker.commerce.productDescription(),
    faker.commerce.productDescription(),
    faker.commerce.productDescription(),
    faker.commerce.productDescription(),
  ],
  name: faker.word.noun(),
  price: faker.commerce.price({ min: 10000, max: 100000 }),
};

const updatedRoomType: UpdateRoomTypeRequest = {
  description: faker.lorem.paragraphs(2),
  currentName: initialRoomType.name,
  features: [
    faker.commerce.productDescription(),
    faker.commerce.productDescription(),
    faker.commerce.productDescription(),
    faker.commerce.productDescription(),
  ],
  name: faker.word.noun(),
  imageFileNames: ["img1.jpeg", "img2.jpeg"],
  roomImageURLS: [faker.image.url(), faker.image.url()],
  price: faker.commerce.price({ min: 10000, max: 100000 }),
};
beforeAll(async () => {
  await startTestServer(3893);
});

afterAll(async () => {
  await stopTestServer();
});

describe("/POST /roomtypes/createRoomType", () => {
  const route = "/api/v1/roomtypes/createRoomType";
  it("should create a room type", async () => {
    const response = await request(app).post(route).send(initialRoomType);
    expect(response.statusCode).toBe(httpstatus.CREATED);
    expect(response.body.isSuccess).toBe(true);
  });

  it("should throw a duplicate entry error", async () => {
    const response = await request(app).post(route).send(initialRoomType);
    expect(response.body.isSuccess).toBe(false);
    expect(response.body.error_type).toBe("Duplicate Entry Error");
  });
});

describe("/GET /roomtypes/getPossibleRoomTypes", () => {
  const route = "/api/v1/roomtypes/getRoomTypes";
  it("should get room types", async () => {
    const response = await request(app).get(route);
    const roomTypeNames = response.body.roomTypes.map(
      (roomType: any) => roomType.name
    );
    expect(response.body.isSuccess).toBe(true);
    expect(roomTypeNames).toContainEqual(initialRoomType.name);
  });
});

describe("/GET /roomtypes/roomTypeDetails", () => {
  const route = "/api/v1/roomtypes/roomTypeDetails";
  it("should get details about a room type", async () => {
    const response = await request(app)
      .get(route)
      .query({ name: initialRoomType.name });
    expect(response.body.roomTypeDetails.name).toEqual(initialRoomType.name);
    expect(response.body.isSuccess).toBe(true);
  });

  it("should throw a not found error if it can't find a particular room type", async () => {
    const response = await request(app).get(route).query({ name: "FAKE ROOM" });
    expect(response.body.isSuccess).toBe(false);
    expect(response.statusCode).toBe(httpstatus.NOT_FOUND);
  });
});

describe("/GET /roomtypes/roomsForRoomType", () => {
  const route = "/api/v1/roomtypes/roomsForRoomType";
  it("should get rooms for a room type", async () => {
    const response = await request(app)
      .get(route)
      .query({ name: initialRoomType.name });
    expect(response.body.isSuccess).toBe(true);
  });

  it("should throw a not found error if it can't find a particular room type for rooms", async () => {
    const response = await request(app).get(route).query({ name: "FAKE ROOM" });
    expect(response.body.isSuccess).toBe(false);
    expect(response.statusCode).toBe(httpstatus.NOT_FOUND);
  });
});

describe("/PATCH /roomtypes/updateRoomType", () => {
  const route = "/api/v1/roomtypes/updateRoomType";
  it("should update a room type", async () => {
    const response = await request(app)
      .patch(route)
      .send({
        name: updatedRoomType.name,
        imageFileNames: updatedRoomType.imageFileNames,
        roomImageURLS: updatedRoomType.roomImageURLS,
      })
      .query({ name: initialRoomType.name });
    expect(response.body.isSuccess).toBe(true);
  });
  it("should throw a not found error when there is no room type that matches params", async () => {
    const response = await request(app)
      .patch(route)
      .send({
        name: updatedRoomType.name,
        imageFileNames: updatedRoomType.imageFileNames,
        roomImageURLS: updatedRoomType.roomImageURLS,
      })
      .query({ name: "Fake Room" });
    expect(response.body.isSuccess).toBe(false);
    expect(response.statusCode).toBe(httpstatus.NOT_FOUND);
  });
});

describe("/DELETE /roomtypes/deleteRoomType", async () => {
  const route = "/api/v1/roomtypes/deleteRoomType";
  it("should delete a room type", async () => {
    const response = await request(app)
      .delete(route)
      .query({ name: updatedRoomType.name });
    expect(response.body.isSuccess).toBe(true);
    expect(response.body.deletedRoomType.name).toEqual(updatedRoomType.name);
  });

  it("should throw a not found error for just deleted room", async () => {
    const response = await request(app)
      .delete(route)
      .query({ name: updatedRoomType.name });
    expect(response.body.isSuccess).toBe(false);
    expect(response.statusCode).toEqual(httpstatus.NOT_FOUND);
  });
});
