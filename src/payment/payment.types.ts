export type CreatePaymentRequest = {
  amount: string;
  reference: string;
  customerEmail: string;
  bookingId: string;
  roomNo: number;
};

export type UpdatePaymentStatus = {
  status?: "pending" | "confirmed" | "failed"
  payedAt?: string;
  reference: string;
}


