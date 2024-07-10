export const adminRoutes = {
  register_admin: "/registerAdmin",
  login_admin: "/loginAdmin",
  delete_admin: "/deleteAdmin",
  update_admin: "/updateAdmin",
  update_admin_email: "/updateAdminEmail",
  update_admin_password: "/updateAdminPassword",
  get_dashboard_details: "/getDashboardDetails",
  update_admin_refresh_token: "/updateRefreshToken",
  list_admins: "/listAdmins",
} as const;

export const customerRoutes = {
  create_customer: "/createCustomer",
  list_customers: "/listCustomers",
  delete_customer: "/deleteCustomer",
  get_customer_details: "/getCustomerDetails",
} as const;

export const paymentRoutes = {
  create_payment: "/createPayment",
  get_payment_details: "/getPaymentDetails",
} as const;

export const otpRoutes = {
  verify_otp: "/verifyOTP",
  send_otp: "/sendOTP",
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
  get_room_types_for_homepage: "/getRoomTypesForHomePage",
  update_room_type: "/updateRoomType",
  room_type_details: "/roomTypeDetails",
  rooms_for_room_type: "/getRoomsForRoomType",
  upload_room_type_images: "/uploadImagesForRoomType",
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
  createRoute({ prefix: "admin", route: "/registerAdmin" }),
  createRoute({ prefix: "admin", route: "/loginAdmin" }),
  createRoute({ prefix: "roomtypes", route: "/getRoomTypesForHomePage" }),
  createRoute({ prefix: "roomtypes", route: "/roomTypeDetails" }),
  createRoute({ prefix: "otp", route: "/sendOTP" }),
  createRoute({ prefix: "otp", route: "/verifyOTP" }),
  createRoute({ prefix: "rooms", route: "/getAvailableRooms" }),
  createRoute({ prefix: "bookings", route: "/checkExpiredBookings" }),
  createRoute({ prefix: "bookings", route: "/createBooking" }),
  createRoute({ prefix: "payments", route: "/createPayment" }),
  createRoute({
    prefix: "bookings",
    route: "/updateBookingPaymentStatus",
  }),
];
