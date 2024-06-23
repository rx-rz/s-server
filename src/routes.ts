import { ENV_VARS } from "../env";

export const adminRoutes = {
  register_admin: "/registerAdmin",
  login_admin: "/loginAdmin",
  delete_admin: "/deleteAdmin",
  update_admin: "/updateAdmin",
  update_admin_email: "/updateAdminEmail",
  update_admin_password: "/updateAdminPassword",
  get_dashboard_details: "/getDashboardDetails",
  update_admin_refresh_token: "/updateRefreshToken",
} as const;

export const customerRoutes = {
  register_customer: "/registerCustomer",
  login_customer: "/loginCustomer",
  list_customers: "/listCustomers",
  delete_customer: "/deleteCustomer",
  update_customer: "/updateCustomer",
  update_customer_email: "/updateCustomerEmail",
  update_customer_password: "/updateCustomerPassword",
  update_customer_refresh_token: "/updateRefreshToken",
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
  room_details: "/getRoomDetails",
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
  rooms_for_room_type: "/getRoomsForRoomType",
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
  includeBaseURL?: boolean;
};

export const createRoute = ({
  prefix,
  route,
  includeBaseURL = false,
}: BaseURLFunctionProps) => {
  if (includeBaseURL) {
    return `/api/v1/${prefix}${route}`;
  }
  return `/${prefix}${route}`;
};

export const routesThatDontRequireAuthentication = [
  createRoute({ prefix: "customers", route: "/registerCustomer" }),
  createRoute({ prefix: "customers", route: "/loginCustomer" }),
  createRoute({ prefix: "admin", route: "/registerAdmin" }),
  createRoute({ prefix: "admin", route: "/loginAdmin" }),
  createRoute({ prefix: "rooms", route: "/getAvailableRooms" }),
  createRoute({ prefix: "bookings", route: "/checkExpiredBookings" }),
  createRoute({
    prefix: "bookings",
    route: "/updateBookingPaymentStatus",
  }),
];

export const customerOnlyRoutes = [
  createRoute({ prefix: "bookings", route: "/createBooking" }),
  createRoute({ prefix: "customers", route: "/deleteCustomer" }),
  createRoute({ prefix: "customers", route: "/updateRefreshToken" }),
  createRoute({ prefix: "customers", route: "/updateCustomer" }),
  createRoute({ prefix: "customers", route: "/updateCustomerEmail" }),
  createRoute({ prefix: "customers", route: "/updateCustomerPassword" }),
];

export const adminOnlyRoutes = [
  createRoute({ prefix: "rooms", route: "/createRooms" }),
  createRoute({ prefix: "rooms", route: "/updateRoom" }),
  createRoute({ prefix: "admin", route: "/updateRefreshToken" }),
  createRoute({ prefix: "rooms", route: "/listRooms" }),
  createRoute({ prefix: "rooms", route: "/deleteRoom" }),
  createRoute({ prefix: "admin", route: "/deleteAdmin" }),
  createRoute({ prefix: "admin", route: "/updateAdmin" }),
  createRoute({ prefix: "admin", route: "/updateAdminEmail" }),
  createRoute({ prefix: "admin", route: "/updateAdminPassword" }),
  createRoute({ prefix: "admin", route: "/getDashboardDetails" }),
  createRoute({ prefix: "bookings", route: "/listBookings" }),
  createRoute({ prefix: "customers", route: "/listCustomers" }),
  createRoute({ prefix: "roomtypes", route: "/createRoomType" }),
  createRoute({ prefix: "roomtypes", route: "/deleteRoomType" }),
  createRoute({ prefix: "roomtypes", route: "/getRoomTypes" }),
  createRoute({ prefix: "roomtypes", route: "/updateRoomType" }),
  createRoute({ prefix: "roomtypes", route: "/roomTypeDetails" }),
  createRoute({ prefix: "roomtypes", route: "/getRoomsForRoomType" }),
];
