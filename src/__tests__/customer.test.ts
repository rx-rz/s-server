import { faker } from "@faker-js/faker";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { generateRefreshToken } from "../middleware/jwt-token";
import { startTestServer } from "../setup-tests";
import { testServerPorts } from "../lib/test-server-ports";
import { createRoute } from "../routes";
import request from "supertest";
import { app } from "../app";
import { authenticatedTestApi } from "./setup";

const customer1 = {
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  password: faker.internet.password(),
};

const customer2 = {
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  password: faker.internet.password(),
};

beforeAll(async () => {
  await startTestServer(testServerPorts.customer);
});

const testApi = request.agent(app);

describe("CUSTOMER", () => {
  const refreshToken = generateRefreshToken(customer1.email);
  const newCustomer = { ...customer1, refreshToken };
  describe("Register new customer", () => {
    const route = createRoute({
      prefix: "customers",
      route: "/registerCustomer",
      includeBaseURL: true,
    });
    it("should register a new customer", async () => {
      const response = await testApi.post(route).send(newCustomer);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toBe("Account created");
    });

    it("should throw a duplicate entry error when registered with the same customer", async () => {
      const response = await testApi.post(route).send(newCustomer);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Duplicate Entry Error");
    });
  });

  describe("Login a customer", () => {
    const route = createRoute({
      prefix: "customers",
      route: "/loginCustomer",
      includeBaseURL: true,
    });

    it("should log in with provided details and return a token", async () => {
      const response = await testApi
        .post(route)
        .send({ email: newCustomer.email, password: newCustomer.password });
      // testApi.set("Cookie", `refreshToken=${refreshToken}`);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.token).toBeDefined();
    });
  });

  describe("Update a customer", async () => {
    const route = createRoute({
      prefix: "customers",
      route: "/updateCustomer",
      includeBaseURL: true,
    });

    it("should update a customer's details- first name and last name in this case", async () => {
      const response = await authenticatedTestApi("CUSTOMER").patch(route).send({
        email: newCustomer.email,
        firstName: customer2.firstName,
        lastName: customer2.lastName,
      });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.customerUpdated.firstName).toBe(customer2.firstName);
      expect(response.body.customerUpdated.lastName).toBe(customer2.lastName);
    });
  });

  describe("Update a customer's email", async () => {
    const route = createRoute({
      prefix: "customers",
      includeBaseURL: true,
      route: "/updateCustomerEmail",
    });

    it("should update a customer's email", async () => {
      const response = await authenticatedTestApi("CUSTOMER").patch(route).send({
        email: customer1.email,
        newEmail: customer2.email,
        password: customer1.password,
      });

      expect(response.body.isSuccess).toBe(true);
      expect(response.body.customerUpdated.email).toBe(customer2.email);
    });

    it("should throw a not found error for invalid password", async () => {
      const response = await authenticatedTestApi("CUSTOMER").patch(route).send({
        email: customer2.email,
        newEmail: customer1.email,
        password: "fakepassword@fakepassword",
      });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  //remember, the correct email is now that of customer2.
  describe("Update a customer's password", async () => {
    const route = createRoute({
      prefix: "customers",
      includeBaseURL: true,
      route: "/updateCustomerPassword",
    });

    it("should update a customer's password", async () => {
      const response = await authenticatedTestApi("CUSTOMER").patch(route).send({
        email: customer2.email,
        //we haven't changed the password yet, just the email so the current password
        //is still that of customer1 👀
        currentPassword: customer1.password,
        newPassword: customer2.password,
      });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.customerUpdated.email).toBe(customer2.email);
    });

    it("should throw a not found error for invalid password", async () => {
      const response = await authenticatedTestApi("CUSTOMER").patch(route).send({
        email: customer2.email,
        newPassword: customer2.password,
        currentPassword: "fakepassword@fakepassword",
      });
      console.log({ response: response.body });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("Update an customer's refresh token", async () => {
    const route = createRoute({
      prefix: "customers",
      route: "/updateRefreshToken",
      includeBaseURL: true,
    });
    it.skip("should update the refresh token", async () => {
      const response = await authenticatedTestApi("CUSTOMER").patch(route).send({
        email: customer2.email,
      });
      expect(response.body.isSuccess).toBe(true);
    });
  });

  // describe("List customers", async () => {
  //   const route = createRoute({
  //     prefix: "customers",
  //     route: "/listCustomers",
  //     includeBaseURL: true,
  //   });
  // });
  describe("Delete an customer", async () => {
    const route = createRoute({
      prefix: "customers",
      route: "/deleteCustomer",
      includeBaseURL: true,
    });

    it("should delete a customer with the provided details", async () => {
      const response = await authenticatedTestApi("CUSTOMER")
        .delete(route)
        .query({ email: customer2.email });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.customerDeleted.email).toBe(customer2.email);
    });
  });
});
