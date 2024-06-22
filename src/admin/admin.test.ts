import { faker } from "@faker-js/faker";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { generateRefreshToken } from "../middleware/jwt-token";
import { startTestServer } from "../setup-tests";
import { testServerPorts } from "../lib/test-server-ports";
import { routeWithBaseURL } from "../routes";
import request from "supertest";
import { app } from "../app";
import { beforeEach } from "node:test";

const admin = {
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  password: faker.internet.password(),
};

const admin2 = {
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  password: faker.internet.password(),
};
let token = "";
beforeAll(async () => {
  await startTestServer(testServerPorts.admin);
});

const testApi = request.agent(app);
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
      const response = await testApi.post(route).send(newAdmin);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toBe("Account created");
    });

    it("should throw a duplicate entry error when registered with the same admin", async () => {
      const response = await testApi.post(route).send(newAdmin);
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
      const response = await testApi
        .post(route)
        .send({ email: newAdmin.email, password: newAdmin.password });
      testApi.set("Authorization", `Bearer ${response.body.token}`);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.token).toBeDefined();
    });
    it("should throw a not found error for invalid credentials", async () => {
      const response = await testApi
        .post(route)
        .send({ email: newAdmin.email, password: "fakePassword@fakePassword" });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("Update an admin", async () => {
    const route = routeWithBaseURL({
      prefix: "admin",
      route: "/updateAdmin",
      returnEntireURL: true,
    });

    it("should update an admin's details- first name and last name in this case", async () => {
      const response = await testApi.patch(route).send({
        email: newAdmin.email,
        firstName: admin2.firstName,
        lastName: admin2.lastName,
      });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.updatedAdmin.firstName).toBe(admin2.firstName);
      expect(response.body.updatedAdmin.lastName).toBe(admin2.lastName);
    });

    it("should throw a not found error for an inexistent admin", async () => {
      const response = await testApi.patch(route).send({
        //we have an admin2 object that has not been created in our test suite which means it's inexistent.
        email: admin2.email,
        firstName: admin2.firstName,
        lastName: admin2.lastName,
      });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });
});
