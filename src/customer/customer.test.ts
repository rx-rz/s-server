import { app } from "../app";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  it,
  test,
  vi,
} from "vitest";
import { CustomerRegisterRequest } from "./customer.types";
import request from "supertest";
import { faker } from "@faker-js/faker";
import { startTestServer, stopTestServer } from "../setup-tests";
import { checkIfPasswordIsCorrect, hashUserPassword } from "./customer.helpers";
import { beforeEach, skip } from "node:test";
import { customerRepository } from "./customer.repository";
import { httpstatus } from "../ctx";

beforeAll(async () => {
  beforeEach(() => {
    vi.mock("./customer.helpers.ts", () => ({
      checkIfPasswordIsCorrect: vi.fn(),
      hashUserPassword: vi.fn(),
    }));
  });
  await startTestServer(4003);
});

afterAll(async () => {
  await stopTestServer();
});

const newCustomer: CustomerRegisterRequest = {
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  password: faker.internet.password(),
};

const inexistentButThenCreatedDuringTestingCustomer: CustomerRegisterRequest = {
  email: faker.internet.email(),
  password: faker.internet.password(),
  lastName: faker.person.lastName(),
  firstName: faker.person.firstName(),
};

describe("/POST /customers/registerCustomer", () => {
  const route = "/api/v1/customers/registerCustomer";
  it("should register a new customer", async () => {
    const response = await request(app).post(route).send(newCustomer);
    expect(response.body.message).toBe("Account created.");
    expect(response.body.isSuccess).toBe(true);
  });

  it("should throw a validation error", async () => {
    const response = await request(app)
      .post(route)
      .send({ ...newCustomer, lastName: 121 });
    expect(response.body.isSuccess).toBe(false);
    expect(response.body.error_type).toBe("Validation Error");
  });

  it("should trigger a duplication error when customer already exists", async () => {
    const response = await request(app).post(route).send(newCustomer);
    expect(response.body.error_type).toBe("Duplicate Entry Error");
  });
});

describe("/GET /otp/sendOTP", () => {
  const route = "/api/v1/otp/sendOTP";
  test("sends an OTP", async () => {
    const response = await request(app)
      .get(route)
      .query({ email: newCustomer.email });
    expectTypeOf(response.body.otpDetails.otp).toBeNumber;
    expect(response.body.isSuccess).toBe(true);
  });
  test("throws a not found error if the email provided is not associated with any user in the DB.", async () => {
    const response = await request(app)
      .get(route)
      .query({ email: "fakeemail@fake.com" });
    expect(response.statusCode).toBe(httpstatus.NOT_FOUND);
  });
});

describe("/POST /customers/loginCustomer", () => {
  const route = "/api/v1/customers/loginCustomer";
  const customerToLogin = {
    email: newCustomer.email,
    password: newCustomer.password,
  };
  it("should login a customer", async () => {
    const passwordIsCorrect = vi
      .mocked(checkIfPasswordIsCorrect)
      .mockResolvedValue(true);
    const response = await request(app).post(route).send(customerToLogin);

    expect(passwordIsCorrect).toHaveBeenCalledTimes(1);
    expect(response.body.isSuccess).toBe(true);
  });

  it("should throw an error when login credentials are not correct", async () => {
    const passwordIsCorrect = vi
      .mocked(checkIfPasswordIsCorrect)
      .mockResolvedValue(false);
    const response = await request(app).post(route).send({
      password: faker.internet.password(),
      email: faker.internet.email(),
    });
    expect(passwordIsCorrect).toHaveBeenCalled();
    expect(response.body.isSuccess).toBe(false);
  });
});

describe("/GET /customers/listCustomers", () => {
  const route = "/api/v1/customers/listCustomers";
  it("should return a list of users", async () => {
    const response = await request(app).get(route);
    expect(response.body.isSuccess).toBe(true);
  });
});

describe("/PATCH /customers/updateCustomer", () => {
  const route = "/api/v1/customers/updateCustomer";
  it("should update a customer", async () => {
    customerRepository.getCustomerDetails = vi
      .fn()
      .mockResolvedValue(newCustomer);
    const response = await request(app).patch(route).send({
      email: newCustomer.email,
      firstName: inexistentButThenCreatedDuringTestingCustomer.firstName,
      lastName: inexistentButThenCreatedDuringTestingCustomer.lastName,
    });
    expect(response.body.isSuccess).toBe(true);
  });

  skip("should throw an error if customer provided does not exist", async () => {
    const response = await request(app)
      .patch(route)
      .send({
        email: faker.internet.email({ allowSpecialCharacters: true }),
        firstName: inexistentButThenCreatedDuringTestingCustomer.firstName,
        lastName: inexistentButThenCreatedDuringTestingCustomer.lastName,
      });
    expect(response.body.error_type).toBe("Not Found Error");
    expect(response.body.isSuccess).toBe(false);
  });
});

describe("/PATCH /customers/updateCustomerEmail", () => {
  const route = "/api/v1/customers/updateCustomerEmail";
  it("should update a customer's email", async () => {
    vi.mocked(checkIfPasswordIsCorrect).mockResolvedValue(true);
    const response = await request(app).patch(route).send({
      email: newCustomer.email,
      /*
      INEXISTENT CUSTOMER BECOMES
      CREATED CUSTOMER HERE.
       */
      newEmail: inexistentButThenCreatedDuringTestingCustomer.email,
      password: newCustomer.password,
    });
    expect(response.body.isSuccess).toBe(true);
  });
  it("should throw a not found error if password is incorrect", async () => {
    vi.mocked(checkIfPasswordIsCorrect).mockResolvedValue(false);
    const response = await request(app).patch(route).send({
      email: newCustomer.email,
      /*
      INEXISTENT CUSTOMER BECOMES
      CREATED CUSTOMER HERE.
       */
      newEmail: inexistentButThenCreatedDuringTestingCustomer.email,
      password: faker.internet.password(),
    });
    expect(response.body.isSuccess).toBe(false);
    expect(response.statusCode).toBe(httpstatus.NOT_FOUND);
  });
});

describe("/PATCH /customers/updateCustomerPassword", () => {
  const route = "/api/v1/customers/updateCustomerPassword";
  it("should update a customer's password", async () => {
    vi.mocked(checkIfPasswordIsCorrect).mockResolvedValue(true);
    const hashPassword = vi
      .mocked(hashUserPassword)
      .mockResolvedValue("hashed password");
    const response = await request(app).patch(route).send({
      email: inexistentButThenCreatedDuringTestingCustomer.email,
      currentPassword: newCustomer.password,
      /*
      CUSTOMER PASSWORD
      UPDATED.
      */
      newPassword: inexistentButThenCreatedDuringTestingCustomer.password,
    });
    expect(hashPassword).toBeCalled();
    expect(response.body.isSuccess).toBe(true);
  });
  it("should throw a not found error when credentials provided are wrong", async () => {
    vi.mocked(checkIfPasswordIsCorrect).mockResolvedValue(false);
    const response = await request(app).patch(route).send({
      email: inexistentButThenCreatedDuringTestingCustomer.email,
      currentPassword: inexistentButThenCreatedDuringTestingCustomer.password,
      newPassword: inexistentButThenCreatedDuringTestingCustomer.password,
    });
    expect(response.body.isSuccess).toBe(false);
    expect(response.statusCode).toBe(httpstatus.NOT_FOUND);
  });
});

describe("/DELETE /customers/deleteCustomer", () => {
  const route = "/api/v1/customers/deleteCustomer";
  skip("should throw an error if customer does not exist", async () => {
    const response = await request(app)
      .delete(route)
      .query({ email: faker.internet.email() });
    expect(response.body.isSuccess).toBe(false);
    expect(response.body.error_type).toBe("Not Found Error");
  });
  it("should delete a customer", async () => {
    const response = await request(app)
      .delete(route)
      .query({ email: inexistentButThenCreatedDuringTestingCustomer.email });
    expect(response.body.isSuccess).toBe(true);
    expect(response.body.deletedCustomer.email).toEqual(
      inexistentButThenCreatedDuringTestingCustomer.email
    );
  });
});
