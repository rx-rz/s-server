import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { generateRefreshToken } from "../middleware/jwt-token";
import { createRoute } from "../routes";
import { authenticatedTestApi, testApi } from "./setup";

const admin1 = {
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

describe("ADMIN", () => {
  const refreshToken = generateRefreshToken(admin1.email);
  const newAdmin = { ...admin1, refreshToken };
  describe("Register new admin", () => {
    const route = createRoute({
      prefix: "admin",
      route: "/registerAdmin",
      includeBaseURL: true,
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
    const route = createRoute({
      prefix: "admin",
      route: "/loginAdmin",
      includeBaseURL: true,
    });

    it("should log in with provided details and return a token", async () => {
      const response = await testApi
        .post(route)
        .send({ email: newAdmin.email, password: newAdmin.password });
      // testApi.set("Cookie", `refreshToken=${refreshToken}`);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.token).toBeDefined();
    });
  });

  describe("Update an admin", async () => {
    const route = createRoute({
      prefix: "admin",
      route: "/updateAdmin",
      includeBaseURL: true,
    });

    it("should update an admin's details- first name and last name in this case", async () => {
      const response = await authenticatedTestApi("ADMIN").patch(route).send({
        email: newAdmin.email,
        firstName: admin2.firstName,
        lastName: admin2.lastName,
      });
      console.log({response})
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.updatedAdmin.firstName).toBe(admin2.firstName);
      expect(response.body.updatedAdmin.lastName).toBe(admin2.lastName);
    });
  });

  describe("Update an admin's email", async () => {
    const route = createRoute({
      prefix: "admin",
      includeBaseURL: true,
      route: "/updateAdminEmail",
    });

    it("should update an admin's email", async () => {
      const response = await authenticatedTestApi("ADMIN").patch(route).send({
        email: admin1.email,
        newEmail: admin2.email,
        password: admin1.password,
      });

      expect(response.body.isSuccess).toBe(true);
      expect(response.body.updatedAdmin.email).toBe(admin2.email);
    });

    it("should throw a not found error for invalid password", async () => {
      const response = await authenticatedTestApi("ADMIN").patch(route).send({
        email: admin2.email,
        newEmail: admin1.email,
        password: "fakepassword@fakepassword",
      });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  //remember, the correct email is now that of admin2.
  describe("Update an admin's password", async () => {
    const route = createRoute({
      prefix: "admin",
      includeBaseURL: true,
      route: "/updateAdminPassword",
    });

    it("should update an admin's password", async () => {
      const response = await authenticatedTestApi("ADMIN").patch(route).send({
        email: admin2.email,
        //we haven't changed the password yet, just the email so the current password
        //is still that of admin1 👀
        currentPassword: admin1.password,
        newPassword: admin2.password,
      });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.updatedAdmin.email).toBe(admin2.email);
    });

    it("should throw a not found error for invalid password", async () => {
      const response = await authenticatedTestApi("ADMIN").patch(route).send({
        email: admin2.email,
        newPassword: admin2.password,
        currentPassword: "fakepassword@fakepassword",
      });
      console.log({ response: response.body });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("Fetching dashboard overview details for admin", async () => {
    const route = createRoute({
      prefix: "admin",
      route: "/getDashboardDetails",
      includeBaseURL: true,
    });
    it("should fetch dashboard details with all the required values", async () => {
      const response = await authenticatedTestApi("ADMIN").get(route);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.bookingsPerMonth).toBeDefined();
      expect(response.body.lastFiveCustomers).toBeDefined();
      expect(response.body.lastFivePayments).toBeDefined();
      expect(response.body.noOfAvailableRooms).toBeDefined();
      expect(response.body.totalProfit).toBeDefined();
    });
  });

  describe("Update an admin's refresh token", async () => {
    const route = createRoute({
      prefix: "admin",
      route: "/updateRefreshToken",
      includeBaseURL: true,
    });
    it.skip("should update the refresh token", async () => {
      const response = await authenticatedTestApi("ADMIN").patch(route).send({
        email: admin2.email,
      });
      expect(response.body.isSuccess).toBe(true);
    });
  });

  describe("Delete an admin", async () => {
    const route = createRoute({
      prefix: "admin",
      route: "/deleteAdmin",
      includeBaseURL: true,
    });

    it("should delete an admin with the provided details", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .delete(route)
        .query({ email: admin2.email });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.adminDeleted.email).toBe(admin2.email);
    });
  });
});
