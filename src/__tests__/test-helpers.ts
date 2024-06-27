import { createRoute } from "../routes";
import { authenticatedTestApi, testApi } from "./setup";

export async function getAvailableRoom() {
  const response = await testApi.get(
    createRoute({
      prefix: "rooms",
      route: "/getAvailableRooms",
      includeBaseURL: true,
    })
  );

  return response.body.availableRooms[0];
}

export async function getCustomer() {
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

export async function getAdmin() {
  const response = await authenticatedTestApi("ADMIN").get(
    createRoute({
      prefix: "admin",
      route: "/listAdmins",
      includeBaseURL: true,
    })
  );
  console.log({ body: response.body });
  return response.body.admins[0];
}

export async function getABooking() {
  const response = await authenticatedTestApi("ADMIN").get(
    createRoute({
      prefix: "bookings",
      route: "/listBookings",
      includeBaseURL: true,
    })
  );
  return response.body.bookings[0];
}
