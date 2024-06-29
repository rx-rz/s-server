import { describe, it } from "vitest";
import { authenticatedTestApi } from "./setup";
import { createRoute } from "../routes";

async function getCustomer() {
  const response = await authenticatedTestApi("ADMIN")
    .get(
      createRoute({
        prefix: "customers",
        route: "/listCustomers",
        includeBaseURL: true,
      })
    )
    .query({ limit: 1 });

  return response.body.customers[0];
}

async function getABooking() {
  const response = await authenticatedTestApi("ADMIN").get(
    createRoute({
      prefix: "bookings",
      route: "/listBookings",
      includeBaseURL: true,
    })
  );
  return response.body.bookings[0];
}

describe("PAYMENT", () => {
  describe("Create payment", () => {
    it("should create a payment")
  });
});
