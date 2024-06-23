import { beforeEach, describe, expect, it, vi } from "vitest";
import { customerRepository } from "./customer.repository";
import { faker } from "@faker-js/faker";
import { checkIfCustomerExists } from "./customer.handlers";
import { NotFoundError } from "../errors";

const customer = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  id: faker.string.uuid(),
  isVerified: false,
  refreshToken: faker.string.uuid(),
  hasCreatedPasswordForAccount: false,
  createdAt: faker.date.birthdate().toString(),
};

vi.mock("./customer.repository.ts", () => ({
  customerRepository: {
    getCustomerDetails: vi.fn(),
  },
}));

describe("Check if the checkIfCustomerExists function works properly", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return existing customer details if customer exists", async () => {
    vi.mocked(customerRepository.getCustomerDetails).mockResolvedValue(
      customer
    );
    const result = await checkIfCustomerExists(customer.email);
    expect(customerRepository.getCustomerDetails).toHaveBeenCalledWith(
      customer.email
    );
    expect(result).toEqual(customer);
  });

  it("should throw a not found error if customer does not exist", async () => {
    const error = new NotFoundError(`Details provided not found`);
    vi.mocked(customerRepository.getCustomerDetails).mockRejectedValue(error);
    await expect(checkIfCustomerExists(customer.email)).rejects.toThrow(
      "Details provided not found"
    );
  });
});
