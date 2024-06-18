export const adminRoutes = {
  register_admin: "/registerAdmin",
  login_admin: "/loginAdmin",
  delete_admin: "/deleteAdmin",
  update_admin: "/updateAdmin",
  update_admin_email: "/updateAdminEmail",
  update_admin_password: "/updateAdminPassword",
  get_dashboard_details: "/getDashboardDetails",
};

export const customerRoutes = {
  register_customer: "/registerCustomer",
  login_customer: "/loginCustomer",
  list_customers: "/listCustomers",
  delete_customer: "/deleteCustomer",
  update_customer: "/updateCustomer",
  update_customer_email: "/updateCustomerEmail",
  update_customer_password: "/updateCustomerPassword",
};

export const paymentRoutes = {
  create_payment: "/createPayment",
  get_payment_details: "/getPaymentDetails",
};

export const otpRoutes = {
  send_otp: "/sendOTP",
  verify_otp: "/verifyOTP",
};

export const roomRoutes = {
  create_rooms: "/createRooms",
  update_rooms: "/updateRoom",
  list_rooms: "/listRooms",
  room_details: "/roomDetails",
  delete_room: "/deleteRoom",
};

export const bookingRoutes = {
  create_booking: "/createBooking",
  update_booking: "/updateBooking",
  delete_booking: "/deleteBooking",
  booking_details: "/bookingDetails",
  list_bookings: "/listBookings",
  update_booking_payment_status: "/updateBookingPaymentStatus",
  check_expired_bookings: "/checkExpiredBookings",
};
