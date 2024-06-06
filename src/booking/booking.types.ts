export type CreateBookingRequest = {
  roomNo: number;
  startDate: string;
  endDate: string;
  customerId: string;
  amount: string;
};

export type UpdateBookingRequest = {
  id: string;
  paymentStatus?: "confirmed" | "pending";
  status?: "active" | "cancelled" | "done" | "pending";
} & Partial<CreateBookingRequest>;

export type Bookings = {
  id: string;
  createdAt: string | null;
  customerId: string;
  amount: string;
  startDate: string;
  endDate: string;
  status: "active" | "cancelled" | "done" | "pending";
  paymentStatus: "pending" | "confirmed";
  roomNo: number;
}[];