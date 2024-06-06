export type CreatePaymentRequest = {
  amount: string;
  reference: string;
  customerId: string;
  bookingId: string;
  roomNo: number;
};

export type UpdatePaymentStatus = {
  status?: "pending" | "confirmed"
  payedAt?: string;
  reference: string;
}


