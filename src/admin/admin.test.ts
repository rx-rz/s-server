import { faker } from "@faker-js/faker";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { generateRefreshToken } from "../middleware/jwt-token";
import { startTestServer } from "../setup-tests";
import { testServerPorts } from "../lib/test-server-ports";
import { routeWithBaseURL } from "../routes";
import request from "supertest";
import { app } from "../app";

const admin = {
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  password: faker.internet.password(),
};
beforeAll(async () => {
  await startTestServer(testServerPorts.admin);
});

describe("ADMIN", () => {
  const refreshToken = generateRefreshToken(admin.email);
  const newAdmin = { ...admin, refreshToken };
  describe("Register new admin", () => {
    const route = routeWithBaseURL({
      prefix: "admin",
      route: "/registerAdmin",
      returnEntireURL: true,
    });
    it("should register a new admin", async () => {
      const response = await request(app).post(route).send(newAdmin);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toBe("Account created");
    });

    it("should throw a duplicate entry error when registered with the same admin", async () => {
      const response = await request(app).post(route).send(newAdmin);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Duplicate Entry Error");
    });
  });

  describe("Login an admin", () => {
    const route = routeWithBaseURL({
      prefix: "admin",
      route: "/loginAdmin",
      returnEntireURL: true,
    });

    it("should log in with provided details and return a token", async () => {
      const response = await request(app)
        .post(route)
        .send({ email: newAdmin.email, password: newAdmin.password });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it("should throw a not found error for invalid credentials", async () => {
      const response = await request(app)
        .post(route)
        .send({ email: newAdmin.email, password: "fakePassword@fakePassword" });
      expect(response.body.isSuccess).toBe(false)
      expect(response.body.error_type).toBe("Not Found Error")
    });
  });

  describe("Update an admin", async () => {
    const route = routeWithBaseURL({
      prefix: "admin",
      route: "/updateAdmin",
      returnEntireURL: true,
    });

    it("should update an admin's details- first name and last name in this case", async () => {
      
    })
  })
});
