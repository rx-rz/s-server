import { describe, it } from "vitest";
import { getABooking } from "./test-helpers";
import { createRoute } from "../routes";
import { testApi } from "./setup";

describe("PAYMENT", () => {
  describe("Create payment", () => {
    const route = createRoute({
      prefix: "payments",
      route: "/createPayment",
      includeBaseURL: true
    })
    it("should create a payment instance in db and return an authorization url to make payment", async () => {
      const booking = await getABooking();
      const email = await 
      const response = await testApi.post({bookingId: booking.id})
  });
});
