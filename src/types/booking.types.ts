export type Booking = {
  customerId: string;
  endDate: string;
  roomNo: number;
  startDate: string;
  amount: string;
  id: string;
  createdAt: string | null;
  status: "pending" | "active" | "cancelled" | "done";
};

export type CreateBookingResponse = {
  bookingCreated: Booking;
  isSuccess: boolean;
};

export type UpdateBookingResponse = {
  bookingUpdated: Booking;
  isSuccess: boolean;
};

export type DeleteBookingResponse = {
  deletedBooking: Booking;
  roomUpdated: {
    roomNo: number;
    createdAt: string | null;
    status: "available" | "pending" | "booked" | null;
    typeId: number;
    noOfTimesBooked: number | null;
  };
  isSuccess: boolean;
};

export type GetBookingDetailsResponse = {
  booking: {
    customerId: string;
    endDate: string;
    roomNo: number;
    startDate: string;
    amount: string;
    id: string;
    createdAt: string | null;
    status: "pending" | "active" | "cancelled" | "done";
    customers: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    room: {
      roomNo: number;
      createdAt: string | null;
      status: "pending" | "available" | "booked" | null;
      typeId: number;
      noOfTimesBooked: number | null;
    };
  };
  isSuccess: boolean;
};

export type CheckExpiredBookingsResponse = {
  bookings: Booking[];
  isSucccess: boolean;
};

export type ListBookingsResponse = {
  maxPageNo: number;
  bookings: Booking[];
  isSuccess: boolean;
};
