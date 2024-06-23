import { beforeEach, describe, expect, it, vi } from "vitest";
import { bookingRepository } from "./booking.repository";
import { faker } from "@faker-js/faker";
import { checkIfBookingExists } from "./booking.handlers";
import { NotFoundError } from "../errors";

const booking = {
  customerId: faker.datatype.uuid(),
  endDate: faker.date.future().toISOString(),
  roomNo: faker.datatype.number({ min: 100, max: 999 }),
  startDate: faker.date.recent().toISOString(),
  amount: faker.finance.amount(100, 1000, 2, "$"),
  id: faker.datatype.uuid(),
  createdAt: faker.datatype.boolean() ? faker.date.past().toISOString() : null,
  status: "pending",
  customers: {
    id: faker.datatype.uuid(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
  },
  room: {
    roomNo: faker.datatype.number({ min: 100, max: 999 }),
    createdAt: faker.datatype.boolean()
      ? faker.date.past().toISOString()
      : null,
    status: "pending" as "pending" | "active" | "cancelled" | "done",
    typeId: faker.datatype.number({ min: 1, max: 10 }),
    noOfTimesBooked: faker.datatype.boolean()
      ? faker.datatype.number({ min: 0, max: 100 })
      : null,
  },
};

vi.mock("./booking.repository.ts", () => ({
  bookingRepository: {
    getBookingDetails: vi.fn(),
  },
}));

describe("Check if the checkIfBookingExists function works properly", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // it.skip("should return existing booking details if booking exists", async () => {
  //   vi.mocked(bookingRepository.getBookingDetails).mockResolvedValue(booking);
  //   const result = await checkIfBookingExists(booking.id);
  //   expect(bookingRepository.getBookingDetails).toHaveBeenCalledWith(
  //     booking.id
  //   );
  //   expect(result).toEqual(booking);
  // });

  it("should throw a not found error if booking does not exist", async () => {
    const error = new NotFoundError(`Details provided not found`);
    vi.mocked(bookingRepository.getBookingDetails).mockRejectedValue(error);
    await expect(checkIfBookingExists(booking.id)).rejects.toThrow(
      "Details provided not found"
    );
  });
});
