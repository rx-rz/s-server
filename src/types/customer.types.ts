export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
  zip: string;
  phoneNo: string;
  address: string;
  refreshToken: string;
  hasCreatedPasswordForAccount: boolean | null;
  createdAt: string | null;
};

export type RegisterCustomerRequest = {
  firstName: string;
  lastName: string;
  zip: string;
  address: string;
  phoneNo: string;
  email: string;
};

export type Search = {
  key: "firstName" | "lastName" | "email" | "createdAt";
  value: number | string | boolean;
}[];
export type ListCustomerRequest = {
  limit: number;
  pageNo: number;
  orderBy: "firstName" | "lastName" | "email" | "createdAt";
  ascOrDesc: "asc" | "desc";
  searchBy?: Search;
};

export type UpdateRefreshTokenRequest = {
  email: string;
  refreshToken: string;
};

export type UpdateCustomerPasswordRequest = {
  email: string;
  currentPassword: string;
  newPassword: string;
};

export type UpdateCustomerRequest = {
  firstName?: string;
  lastName?: string;
  hasSetPasswordForAccount?: boolean;

  zip?: string;
  phoneNo?: string;
  address?: string;
  email: string;
};

export type UpdateCustomerEmailRequest = {
  email: string;
  newEmail: string;
  password: string;
};

export type RegisterCustomerResponse = {
  message: string;
  isSuccess: boolean;
  customerIsNew?: boolean;
};

export type LoginCustomerResponse = {
  token: string;
  isSuccess: boolean;
};

export type GetCustomerDetailsResponse = {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    zip: string;
    phoneNo: string;
    address: string;
    email: string;
    createdAt: string | null;
    hasCreatedPasswordForAccount: boolean | null;
    bookings: {
      status: "pending" | "active" | "cancelled" | "done";
      id: string;
      createdAt: string | null;
      customerEmail: string;
      amount: string;
      roomNo: number;
      startDate: string;
      endDate: string;
    }[];
    payments: {
      bookingId: string;
      reference: string;
      payedAt: string | null;
      status: "pending" | "confirmed" | "failed";
      id: string;
      createdAt: string | null;
      customerEmail: string;
      amount: string;
      roomNo: number;
    }[];
  };
  isSuccess: boolean;
};

export type ListCustomersResponse = {
  customers: Customer[];
  noOfCustomers: number;
  maxPageNo: number;
  isSuccess: true;
};

export type DeleteCustomerResponse = {
  customer: Customer;
  isSuccess: boolean;
};

export type UpdateCustomerResponse = {
  customerUpdated: Customer;
  isSuccess: boolean;
};

export type UpdateCustomerEmailResponse = {
  customerUpdated: Customer;
  isSuccess: boolean;
};

export type UpdateCustomerPasswordResponse = {
  customerUpdated: Customer;
  isSuccess: boolean;
};
