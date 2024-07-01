export type Booking = {
  id: string;
  createdAt: string | null;
  customerEmail: string;
  amount: string;
  startDate: string;
  endDate: string;
  status: "active" | "cancelled" | "done" | "pending";
  roomNo: number;
};

export type CreateBookingRequest = {
  roomNo: number;
  startDate: string;
  endDate: string;
  customerEmail: string;
  amount: string;
};

export type UpdateBookingRequest = {
  id: string;
  status?: "active" | "cancelled" | "done" | "pending";
} & Partial<CreateBookingRequest>;

export type Bookings = Bookings[];

export type Search = {
  key: keyof Booking;
  value: number | string;
}[];

export type ListBookingRequest = {
  limit: number;
  pageNo: number;
  searchBy?: Search;
  ascOrDesc: "asc" | "desc";
  orderBy: keyof Booking;
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
    customerEmail: string;
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
