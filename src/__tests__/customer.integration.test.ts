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
          route: "/createCustomer",
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
            route: "/createCustomer",
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
