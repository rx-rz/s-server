import { ENV_VARS } from "../env";

export const adminRoutes = {
  register_admin: "/registerAdmin",
  login_admin: "/loginAdmin",
  delete_admin: "/deleteAdmin",
  update_admin: "/updateAdmin",
  update_admin_email: "/updateAdminEmail",
  update_admin_password: "/updateAdminPassword",
  get_dashboard_details: "/getDashboardDetails",
} as const;

export const customerRoutes = {
  register_customer: "/registerCustomer",
  login_customer: "/loginCustomer",
  list_customers: "/listCustomers",
  delete_customer: "/deleteCustomer",
  update_customer: "/updateCustomer",
  update_customer_email: "/updateCustomerEmail",
  update_customer_password: "/updateCustomerPassword",
} as const;

export const paymentRoutes = {
  create_payment: "/createPayment",
  get_payment_details: "/getPaymentDetails",
} as const;

export const otpRoutes = {
  send_otp: "/sendOTP",
  verify_otp: "/verifyOTP",
} as const;

export const roomRoutes = {
  create_rooms: "/createRooms",
  update_rooms: "/updateRoom",
  list_rooms: "/listRooms",
  room_details: "/roomDetails",
  delete_room: "/deleteRoom",
  get_available_rooms: "/getAvailableRooms",
} as const;

export const bookingRoutes = {
  create_booking: "/createBooking",
  update_booking: "/updateBooking",
  delete_booking: "/deleteBooking",
  booking_details: "/bookingDetails",
  list_bookings: "/listBookings",
  update_booking_payment_status: "/updateBookingPaymentStatus",
  check_expired_bookings: "/checkExpiredBookings",
} as const;

export const roomTypeRoutes = {
  create_room_type: "/createRoomType",
  delete_room_type: "/deleteRoomType",
  get_room_types: "/getRoomTypes",
  update_room_type: "/updateRoomType",
  room_type_details: "/roomTypeDetails",
  rooms_for_room_type: "/roomsForRoomType",
} as const;

type BaseURLFunctionProps = {
  route:
    | (typeof customerRoutes)[keyof typeof customerRoutes]
    | (typeof adminRoutes)[keyof typeof adminRoutes]
    | (typeof paymentRoutes)[keyof typeof paymentRoutes]
    | (typeof otpRoutes)[keyof typeof otpRoutes]
    | (typeof roomRoutes)[keyof typeof roomRoutes]
    | (typeof bookingRoutes)[keyof typeof bookingRoutes]
    | (typeof roomTypeRoutes)[keyof typeof roomTypeRoutes];
  prefix:
    | "admin"
    | "customers"
    | "otp"
    | "admin"
    | "roomtypes"
    | "rooms"
    | "bookings"
    | "payments";
  returnEntireURL?: boolean;
};

export const routeWithBaseURL = ({
  prefix,
  route,
  returnEntireURL = false,
}: BaseURLFunctionProps) => {
  if (returnEntireURL) {
    return `http://${ENV_VARS.HOST}/${ENV_VARS.PORT}/api/v1/${prefix}${route}`;
  }
  return `/${prefix}${route}`;
};

export const routesThatDontRequireAuthentication = [
  routeWithBaseURL({ prefix: "customers", route: "/registerCustomer" }),
  routeWithBaseURL({ prefix: "customers", route: "/loginCustomer" }),
  routeWithBaseURL({ prefix: "admin", route: "/registerAdmin" }),
  routeWithBaseURL({ prefix: "admin", route: "/loginAdmin" }),
  routeWithBaseURL({ prefix: "rooms", route: "/getAvailableRooms" }),
  routeWithBaseURL({ prefix: "bookings", route: "/checkExpiredBookings" }),
  routeWithBaseURL({
    prefix: "bookings",
    route: "/updateBookingPaymentStatus",
  }),
];

export const customerOnlyRoutes = [
  routeWithBaseURL({ prefix: "bookings", route: "/createBooking" }),
  routeWithBaseURL({ prefix: "customers", route: "/deleteCustomer" }),
  routeWithBaseURL({ prefix: "customers", route: "/updateCustomer" }),
  routeWithBaseURL({ prefix: "customers", route: "/updateCustomerEmail" }),
  routeWithBaseURL({ prefix: "customers", route: "/updateCustomerPassword" }),
];

export const adminOnlyRoutes = [
  routeWithBaseURL({ prefix: "rooms", route: "/createRooms" }),
  routeWithBaseURL({ prefix: "rooms", route: "/updateRoom" }),
  routeWithBaseURL({ prefix: "rooms", route: "/listRooms" }),
  routeWithBaseURL({ prefix: "rooms", route: "/deleteRoom" }),
  routeWithBaseURL({ prefix: "admin", route: "/deleteAdmin" }),
  routeWithBaseURL({ prefix: "admin", route: "/updateAdmin" }),
  routeWithBaseURL({ prefix: "admin", route: "/updateAdminEmail" }),
  routeWithBaseURL({ prefix: "admin", route: "/updateAdminPassword" }),
  routeWithBaseURL({ prefix: "admin", route: "/getDashboardDetails" }),
  routeWithBaseURL({ prefix: "bookings", route: "/listBookings" }),
  routeWithBaseURL({ prefix: "customers", route: "/listCustomers" }),
  routeWithBaseURL({ prefix: "roomtypes", route: "/createRoomType" }),
  routeWithBaseURL({ prefix: "roomtypes", route: "/deleteRoomType" }),
  routeWithBaseURL({ prefix: "roomtypes", route: "/getRoomTypes" }),
  routeWithBaseURL({ prefix: "roomtypes", route: "/updateRoomType" }),
  routeWithBaseURL({ prefix: "roomtypes", route: "/roomTypeDetails" }),
  routeWithBaseURL({ prefix: "roomtypes", route: "/roomsForRoomType" }),
];
