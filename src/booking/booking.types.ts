export type CreateBookingRequest = {
  roomNo: number;
  startDate: string;
  endDate: string;
  customerId: string;
  amount: string;
};

export type UpdateBookingRequest = {
  id: string;
  status?: "active" | "cancelled" | "done" | "pending";
} & Partial<CreateBookingRequest>;

export type Booking = {
  id: string;
  createdAt: string | null;
  customerId: string;
  amount: string;
  startDate: string;
  endDate: string;
  status: "active" | "cancelled" | "done" | "pending";
  roomNo: number;
};

export type Bookings = Bookings[];

export type Search = {
  key: keyof Booking;
  value: number | string;
}[];

export type ListBookingParams = {
  limit: number;
  pageNo: number;
  searchBy?: Search;
  ascOrDesc: "asc" | "desc";
  orderBy: keyof Booking;
};
