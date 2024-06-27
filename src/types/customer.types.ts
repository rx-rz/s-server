export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
  isVerified: boolean | null;
  refreshToken: string;
  hasCreatedPasswordForAccount: boolean | null;
  createdAt: string | null;
};

export type RegisterCustomerResponse = {
  message: string;
  isSuccess: boolean;
};

export type LoginCustomerResponse = {
  token: string;
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
