import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { testApi } from "./setup";
import { createRoute } from "../routes";
import { SendOTPResponse, VerifyOTPResponse } from "../types/otp.types";

type UserCreationObject = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string | undefined;
};

let testCustomer: UserCreationObject;
let testAdmin: UserCreationObject;
let adminOtp: number;
let customerOtp: number;

beforeAll(async () => {
  testCustomer = {
    email: faker.internet.email(),
    lastName: faker.person.lastName(),
    firstName: faker.person.firstName(),
    password: faker.internet.password(),
  };
  testAdmin = {
    email: faker.internet.email(),
    lastName: faker.person.lastName(),
    firstName: faker.person.firstName(),
    password: faker.internet.password(),  
  };

  await Promise.all([
    testApi
      .post(
        createRoute({
          prefix: "customers",
          route: "/registerCustomer",
          includeBaseURL: true,
        })
      )
      .send(testCustomer),
    testApi
      .post(
        createRoute({
          prefix: "admin",
          route: "/registerAdmin",
          includeBaseURL: true,
        })
      )
      .send(testAdmin),
  ]);
});
afterAll(async () => {
  await Promise.all([
    testApi
      .delete(
        createRoute({
          prefix: "customers",
          route: "/deleteCustomer",
          includeBaseURL: true,
        })
      )
      .query({ email: testCustomer.email }),
    testApi
      .delete(
        createRoute({
          prefix: "admin",
          route: "/registerAdmin",
          includeBaseURL: true,
        })
      )
      .query({ email: testAdmin.email }),
  ]);
});
describe("OTP", () => {
  describe("Send OTP", () => {
    const route = createRoute({
      prefix: "otp",
      route: "/sendOTP",
      includeBaseURL: true,
    });
    it("should send otp details for a customer", async () => {
      const response = await testApi
        .post(route)
        .send({ email: testCustomer.email, role: "customer" });
      const responseBody: SendOTPResponse = response.body;
      customerOtp = responseBody.otpDetails.otp;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.otpDetails.role).toBe("customer");
    });

    it("should send otp details for an admin", async () => {
      const response = await testApi
        .post(route)
        .send({ email: testAdmin.email, role: "admin" });
      const responseBody: SendOTPResponse = response.body;
      adminOtp = responseBody.otpDetails.otp;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.otpDetails.role).toBe("admin");
    });

    it("should throw a not found error for an inexistent user", async () => {
      const response = await testApi
        .post(route)
        .send({ email: "fake@fake.com", role: "admin" });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });
  describe("Verify OTP", () => {
    const route = createRoute({
      prefix: "otp",
      route: "/verifyOTP",
      includeBaseURL: true,
    });
    it("should verify customer otp", async () => {
      const response = await testApi
        .post(route)
        .send({ email: testCustomer.email, otp: customerOtp });
      const responseBody: VerifyOTPResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.message).toBeDefined();
    });

    it("should verify admin otp", async () => {
      const response = await testApi
        .post(route)
        .send({ email: testAdmin.email, otp: adminOtp });
      const responseBody: VerifyOTPResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.message).toBeDefined();
    });

    it("should throw a not found error for an inexistent user", async () => {
      const response = await testApi
        .post(route)
        .send({ email: "fake@fake.hotmail", otp: adminOtp });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });

    it("should throw a not found error for if an invalid / inexistent otp is provided", async () => {
      const response = await testApi
        .post(route)
        .send({
          email: testAdmin.email,
          otp: faker.number.int({ min: 1000000, max: 1100000 }),
        });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });
});
