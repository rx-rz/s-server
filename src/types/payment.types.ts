export type CreatePaymentRequest = {
  bookingId: string;
  email: string;
};

export type CreatePaymentResponse = {
  payment: {
    amount: string;
    id: string;
    createdAt: string | null;
    customerId: string;
    bookingId: string;
    paymentReference: string;
    paymentUrl: string;
  };
  isSuccess: boolean;
};

export type PaymentDetailsRequest = {
  paymentDetails: {
    bookingId: string;
    status: "pending" | "confirmed" | "failed";
    id: string;
    createdAt: string | null;
    amount: string;
    roomNo: number;
    payedAt: string | null;
    customerId: string;
    reference: string;
    customer: {
      email: string;
      id: string;
      firstName: string;
      lastName: string;
      createdAt: string | null;
      isVerified: boolean | null;
      refreshToken: string;
      password: string | null;
      phoneNo: string | null;
      address: string | null;
      zip: string | null;
    };
    booking: {
      status: "pending" | "active" | "cancelled" | "done";
      id: string;
      createdAt: string | null;
      customerEmail: string;
      amount: string;
      roomNo: number;
      startDate: string;
      endDate: string;
    };
  };
  isSuccess: boolean;
};
