import { faker } from "@faker-js/faker";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateRefreshToken } from "../middleware/jwt-token";
import { createRoute } from "../routes";
import { authenticatedTestApi, testApi } from "./setup";
import { httpstatus } from "../ctx";
import qs from "qs";
import {
  GetCustomerDetailsResponse,
  ListCustomersResponse,
  LoginCustomerResponse,
  RegisterCustomerResponse,
  UpdateCustomerEmailResponse,
  UpdateCustomerPasswordResponse,
  UpdateCustomerResponse,
} from "../types/customer.types";

type CustomerRegisterObject = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  zip: string;
  phoneNo: string;
  address: string;
};

let testCustomer: CustomerRegisterObject;

describe("CUSTOMER", () => {
  beforeEach(async () => {
    testCustomer = {
      email: faker.internet.email(),
      lastName: faker.person.lastName(),
      firstName: faker.person.firstName(),
      password: faker.internet.password(),
      zip: faker.location.zipCode(),
      phoneNo: faker.phone.number(),
      address: faker.location.streetAddress(),
    };
    await testApi
      .post(
        createRoute({
          prefix: "customers",
          route: "/registerCustomer",
          includeBaseURL: true,
        })
      )
      .send(testCustomer);
  });

  afterEach(async () => {
    await authenticatedTestApi("CUSTOMER")
      .delete(
        createRoute({
          prefix: "customers",
          route: "/deleteCustomer",
          includeBaseURL: true,
        })
      )
      .query({ email: testCustomer.email });
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
        .send({ email: testCustomer.email, password: testCustomer.password });
      const responseBody: LoginCustomerResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.token).toBeDefined();
    });
    it("should throw an error when invalid credentials are provided for the customer", async () => {
      const response = await testApi.post(route).send({
        email: testCustomer.email,
        password: "#fakepassword#fake@123",
      });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("Get details for a customer", async () => {
    const route = createRoute({
      prefix: "customers",
      route: "/getCustomerDetails",
      includeBaseURL: true,
    });

    it("should fetch the details of a particular customer", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ email: testCustomer.email });
      const responseBody: GetCustomerDetailsResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.customer.email).toBe(testCustomer.email);
    });

    const response = await authenticatedTestApi("CUSTOMER")
      .get(route)
      .query({ email: "Fake@Fake.com" });
    expect(response.body.isSuccess).toBe(false);
    expect(response.body.error_type).toBe("Not Found Error");
  });

  describe("Update a customer", async () => {
    const route = createRoute({
      prefix: "customers",
      route: "/updateCustomer",
      includeBaseURL: true,
    });

    it.skip("should update a customer's details- first name and last name in this case", async () => {
      const [firstName, lastName] = [
        faker.person.firstName(),
        faker.person.lastName(),
      ];
      const response = await authenticatedTestApi("CUSTOMER")
        .patch(route)
        .send({
          email: testCustomer.email,
          firstName,
          lastName,
        });
      const responseBody: UpdateCustomerResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.customerUpdated.firstName).toBe(firstName);
      expect(responseBody.customerUpdated.lastName).toBe(lastName);
    });

    it("should throw a not found error if the customer details for update provided are incorrect", async () => {
      const response = await authenticatedTestApi("CUSTOMER")
        .patch(route)
        .send({
          email: "fakeemail@email.fake",
          firstName: testCustomer.firstName,
          lastName: testCustomer.lastName,
        });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("List customers", async () => {
    const route = createRoute({
      prefix: "customers",
      route: "/listCustomers",
      includeBaseURL: true,
    });

    it("should return a list of customers with default parameters", async () => {
      const response = await authenticatedTestApi("ADMIN").get(route);
      const responseBody: ListCustomersResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(Array.isArray(responseBody.customers)).toBe(true);
      expect(typeof responseBody.noOfCustomers).toBe("number");
      expect(typeof responseBody.maxPageNo).toBe("number");
    });

    it("should apply pagination correctly", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ limit: 5 });
      const responseBody: ListCustomersResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.customers.length).toBeLessThanOrEqual(5);
    });

    it("should apply text search filters for first name, last name and email correctly", async () => {
      const [email, password, firstName, lastName] = [
        faker.internet.email(),
        faker.internet.password(),
        faker.person.firstName(),
        faker.person.lastName(),
      ];
      await testApi
        .post(
          createRoute({
            prefix: "customers",
            route: "/registerCustomer",
            includeBaseURL: true,
          })
        )
        .send({
          email,
          firstName,
          lastName,
          password,
        });
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query(
          qs.stringify({
            searchBy: [
              {
                key: "firstName",
                value: firstName,
              },
              {
                key: "lastName",
                value: lastName,
              },
              {
                key: "email",
                value: email,
              },
              {
                key: "isVerified",
                value: false,
              },
            ],
          })
        );
      const responseBody: ListCustomersResponse = response.body;
      const matchingCustomer = responseBody.customers.find(
        (customer) =>
          customer.email === email &&
          customer.firstName === firstName &&
          customer.lastName === lastName
      );
      expect(response.body.isSuccess).toBe(true);
      expect(matchingCustomer).toBeDefined();
    });

    it("should throw validation errors for invalid query parameters", async () => {
      const response = await authenticatedTestApi("ADMIN")
        .get(route)
        .query({ limit: "10seconds" });
      expect(response.body.isSuccess).toBe(false);
    });
  });

  describe("Update a customer's email", async () => {
    const route = createRoute({
      prefix: "customers",
      includeBaseURL: true,
      route: "/updateCustomerEmail",
    });
    const newEmail = faker.internet.email();
    it("should update a customer's email", async () => {
      const response = await authenticatedTestApi("CUSTOMER")
        .patch(route)
        .send({
          email: testCustomer.email,
          newEmail,
          password: testCustomer.password,
        });
      const responseBody: UpdateCustomerEmailResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.customerUpdated.email).toBe(newEmail);
    });

    it("should throw a not found error for invalid password", async () => {
      const response = await authenticatedTestApi("CUSTOMER")
        .patch(route)
        .send({
          email: testCustomer.email,
          newEmail,
          password: "fakepassword@fakepassword",
        });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });

  describe("Update a customer's password", async () => {
    const route = createRoute({
      prefix: "customers",
      includeBaseURL: true,
      route: "/updateCustomerPassword",
    });
    const newPassword = faker.internet.password();
    it("should update a customer's password", async () => {
      const response = await authenticatedTestApi("CUSTOMER")
        .patch(route)
        .send({
          email: testCustomer.email,
          currentPassword: testCustomer.password,
          newPassword,
        });
      const responseBody: UpdateCustomerPasswordResponse = response.body;
      expect(responseBody.isSuccess).toBe(true);
      expect(responseBody.customerUpdated.email).toBe(testCustomer.email);
    });

    it("should throw a not found error for invalid password", async () => {
      const response = await authenticatedTestApi("CUSTOMER")
        .patch(route)
        .send({
          email: testCustomer.email,
          newPassword: testCustomer.password,
          currentPassword: "fakepassword@fakepassword",
        });
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

    it.skip("should throw an unauthorized error if there is no refresh token", async () => {
      const response = await authenticatedTestApi("CUSTOMER")
        .patch(route)
        .set({ Cookie: "" })
        .send({ email: testCustomer.email });
      expect(response.body.isSuccess).toBe(false);
      expect(response.statusCode).toBe(httpstatus.UNAUTHORIZED);
    });

    it.skip("should update an customer's refresh token in the db and in cookies", async () => {
      const refreshToken = generateRefreshToken(faker.internet.email());
      const response = await authenticatedTestApi("CUSTOMER")
        .patch(route)
        .set({ Cookie: `refreshToken=${refreshToken}` })
        .send({ email: testCustomer.email });
      const newCookie = response.headers["set-cookie"][0];
      const newRefreshToken = newCookie.split("refreshToken=")[1].split(";")[0];
      expect(response.body.isSuccess).toBe(true);
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(newRefreshToken).not.toBe(refreshToken);
    });
  });

  describe("Delete a customer", async () => {
    const route = createRoute({
      prefix: "customers",
      route: "/deleteCustomer",
      includeBaseURL: true,
    });

    it("should delete a customer with the provided details", async () => {
      const response = await authenticatedTestApi("CUSTOMER")
        .delete(route)
        .query({ email: testCustomer.email });
      const responseBody: UpdateCustomerPasswordResponse = response.body;
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.customerDeleted.email).toBe(testCustomer.email);
    });

    it("should throw a not found error for  an inexistent customer", async () => {
      const response = await authenticatedTestApi("CUSTOMER")
        .delete(route)
        .query({ email: faker.internet.email() });
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.error_type).toBe("Not Found Error");
    });
  });
});
