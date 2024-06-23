import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminRepository } from "./admin.repository";
import { faker } from "@faker-js/faker";
import { checkIfAdminExists } from "./admin.handlers";
import { NotFoundError } from "../errors";

const admin = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  id: faker.string.uuid(),
  isVerified: false,
};

vi.mock("./admin.repository.ts", () => ({
  adminRepository: {
    getAdminDetails: vi.fn(),
  },
}));

describe("Check if the checkIfAdminExists function works properly", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return existing admin details if admin exists", async () => {
    vi.mocked(adminRepository.getAdminDetails).mockResolvedValue(admin);
    const result = await checkIfAdminExists(admin.email);
    expect(adminRepository.getAdminDetails).toHaveBeenCalledWith(admin.email);
    expect(result).toEqual(admin);
  });

  it("should throw a not found error if admin does not exist", async () => {
    const error = new NotFoundError(`Details provided not found`)
    vi.mocked(adminRepository.getAdminDetails).mockRejectedValue(error);
    await expect(checkIfAdminExists(admin.email)).rejects.toThrow("Details provided not found")
  });
});
