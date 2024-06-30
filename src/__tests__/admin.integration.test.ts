import { faker } from "@faker-js/faker";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { generateRefreshToken } from "../middleware/jwt-token";
import { createRoute } from "../routes";
import { authenticatedTestApi, testApi } from "./setup";
import { httpstatus } from "../ctx";
import { AdminDashboardOverviewDetails, LoginAdminResponse, RegisterAdminResponse, UpdateAdminEmailResponse, UpdateAdminPasswordResponse, UpdateAdminResponse } from "../types/admin.types";

type AdminRegisterObject = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};
let testAdmin: AdminRegisterObject;

describe("ADMIN", () => {
  describe("Register new admin", () => {
    const admin = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password(),
    };
    const refreshToken = generateRefreshToken(admin.email);
    const newAdmin = { ...admin, refreshToken };
    const route = createRoute({
      prefix: "admin",
      route: "/registerAdmin",
      includeBaseURL: true,
    });
    it("should register a new admin", async () => {
      const response = await testApi.post(route).send(newAdmin);
      const responseBody: RegisterAdminResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.message).toBe("Account created");
    });

    it("should throw a duplicate entry error when registered with the same admin", async () => {
      const response = await testApi.post(route).send(newAdmin);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Duplicate Entry Error");
    });
  });

  beforeEach(async () => {
    testAdmin = {
      email: faker.internet.email(),
      lastName: faker.person.lastName(),
      firstName: faker.person.firstName(),
      password: faker.internet.password(),
    };
    await testApi
      .post(
        createRoute({
          prefix: "admin",
          route: "/registerAdmin",
          includeBaseURL: true,
        })
      )
      .send(testAdmin);
  });

  afterEach(async () => {
    await authenticatedTestApi("ADMIN")
      .delete(
        createRoute({
          prefix: "admin",
          route: "/deleteAdmin",
          includeBaseURL: true,
        })
      )
      .query({ email: testAdmin.email });
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
        .send({ email: testAdmin.email, password: testAdmin.password });
      const responseBody: LoginAdminResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.token).toBeDefined();
    });

    it("should throw a not found error if the login details provided are incorrect", async () => {
      const response = await testApi.post(route).send({
        email: testAdmin.email,
        password: "fakePassword@fakePassword",
      });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("Update an admin", async () => {
    const route = createRoute({
      prefix: "admin",
      route: "/updateAdmin",
      includeBaseURL: true,
    });

    it("should update an admin's details- first name and last name in this case", async () => {
      const [firstName, lastName] = [
        faker.person.firstName(),
        faker.person.lastName(),
      ];
      const response = await authenticatedTestApi("ADMIN").patch(route).send({
        email: testAdmin.email,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      const responseBody: UpdateAdminResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      // expect(responseBody.adminUpdated.firstName).toBe(firstName);
      // expect(responseBody.adminUpdated.lastName).toBe(lastName);
    });

    it("should throw a not found error if the admin details for update provided are incorrect", async () => {
      const response = await authenticatedTestApi("ADMIN").patch(route).send({
        email: "fakeemail@email.fake",
        firstName: testAdmin.firstName,
        lastName: testAdmin.lastName,
      });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("Update an admin's email", async () => {
    const route = createRoute({
      prefix: "admin",
      includeBaseURL: true,
      route: "/updateAdminEmail",
    });
    const newEmail = faker.internet.email();
    it("should update an admin's email", async () => {
      const response = await authenticatedTestApi("ADMIN").patch(route).send({
        email: testAdmin.email,
        newEmail,
        password: testAdmin.password,
      });
      const responseBody: UpdateAdminEmailResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.adminUpdated.email).toBe(newEmail);
    });

    it("should throw a not found error for invalid password", async () => {
      const response = await authenticatedTestApi("ADMIN").patch(route).send({
        email: testAdmin.email,
        newEmail,
        password: "fakepassword@fakepassword",
      });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("Update an admin's password", async () => {
    const route = createRoute({
      prefix: "admin",
      includeBaseURL: true,
      route: "/updateAdminPassword",
    });
    const newPassword = faker.internet.password();
    it("should update an admin's password", async () => {
      const response = await authenticatedTestApi("ADMIN").patch(route).send({
        email: testAdmin.email,
        currentPassword: testAdmin.password,
        newPassword,
      });
      const responseBody: UpdateAdminPasswordResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.adminUpdated.email).toBe(testAdmin.email);
    });

    it("should throw a not found error for invalid password", async () => {
      const response = await authenticatedTestApi("ADMIN").patch(route).send({
        email: testAdmin.email,
        newPassword: testAdmin.password,
        currentPassword: "fakepassword@fakepassword",
      });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("Update an admin's refresh token", async () => {
    const route = createRoute({
      prefix: "admin",
      route: "/updateRefreshToken",
      includeBaseURL: true,
    });

    it.skip("should throw an unauthorized error if there is no refresh token", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .patch(route)
        .set({ Cookie: "" })
        .send({ email: testAdmin.email });
      expect(response.body.isSuccess).toBe(false);
      expect(response.statusCode).toBe(httpstatus.UNAUTHORIZED);
    });

    it("should update an admin's refresh token in the db and in cookies", async () => {
      const refreshToken = generateRefreshToken(faker.internet.email());
      const response = await authenticatedTestApi("ADMIN")
        .patch(route)
        .set({ Cookie: `refreshToken=${refreshToken}` })
        .send({ email: testAdmin.email });
      const newCookie = response.headers["set-cookie"][0];
      const newRefreshToken = newCookie.split("refreshToken=")[1].split(";")[0];
      expect(response.body.isSuccess).toBe(true);
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(newRefreshToken).not.toBe(refreshToken);
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
      const responseBody: AdminDashboardOverviewDetails = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.bookingsPerMonth).toBeDefined();
      expect(responseBody.lastFiveCustomers).toBeDefined();
      expect(responseBody.lastFivePayments).toBeDefined();
      expect(responseBody.noOfAvailableRooms).toBeDefined();
      expect(responseBody.totalProfit).toBeDefined();
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
        .query({ email: testAdmin.email });
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.adminDeleted.email).toBe(testAdmin.email);
    });

    it("should throw a not found error for  an inexistent admin", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .delete(route)
        .query({ email: faker.internet.email() });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });
});
