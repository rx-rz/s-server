import {
  GetAvailableRoomsResponse,
  ListRoomsResponse,
} from "../types/room.types";
import { createRoute } from "../routes";
import { ListAdminsResponse } from "../types/admin.types";
import { ListBookingsResponse } from "../types/booking.types";
import { ListCustomersResponse } from "../types/customer.types";
import { GetRoomTypesResponse } from "../types/roomtype.types";
import { authenticatedTestApi, testApi } from "./setup";
export async function getACustomerByEmail(email: string){
  const response = await authenticatedTestApi("ADMIN").get(createRoute({
    prefix: "customers",
    route: "/customer"
  }))
}
export async function getAvailableRoom() {
  const response = await testApi.get(
    createRoute({
      prefix: "rooms",
      route: "/getAvailableRooms",
      includeBaseURL: true,
    })
  );
  const responseBody: GetAvailableRoomsResponse = response.body;
  return responseBody.availableRooms[0];
}

export async function getRoomTypeID() {
  const response = await authenticatedTestApi("ADMIN").get(
    createRoute({
      prefix: "roomtypes",
      route: "/getRoomTypes",
      includeBaseURL: true,
    })
  );
  const responseBody: GetRoomTypesResponse = response.body;
  return responseBody.roomTypes[0].id;
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
  const responseBody: ListCustomersResponse = response.body;
  return responseBody.customers[0];
}

export async function getAdmin() {
  const response = await authenticatedTestApi("ADMIN").get(
    createRoute({
      prefix: "admin",
      route: "/listAdmins",
      includeBaseURL: true,
    })
  );
  const responseBody: ListAdminsResponse = response.body;
  return responseBody.admins[0];
}

export async function getABooking() {
  const response = await authenticatedTestApi("ADMIN").get(
    createRoute({
      prefix: "bookings",
      route: "/listBookings",
      includeBaseURL: true,
    })
  );
  const responseBody: ListBookingsResponse = response.body;
  return responseBody.bookings[0];
}

export async function getARoom(available?: boolean) {
  const response: any = await authenticatedTestApi("ADMIN").get(
    createRoute({
      prefix: "rooms",
      route: "/listRooms",
      includeBaseURL: true,
    })
  );
  const responseBody: ListRoomsResponse = response.body;
  return responseBody.rooms[0];
}
