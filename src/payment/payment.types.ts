export type CreatePaymentRequest = {
  amount: string;
  reference: string;
  customerId: string;
  bookingId: string;
};

export type UpdatePaymentStatus = {
  status?: "pending" | "confirmed"
  payedAt?: string;
  reference: string;
}


