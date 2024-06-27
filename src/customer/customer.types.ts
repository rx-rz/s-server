export type CustomerRegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  refreshToken: string;
};

export type CustomerListObject = {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  id: string;
  isVerified: boolean;
};
export type CustomerRegisterResponse = {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
};

export type UpdateCustomerPasswordRequest = {
  email: string;
  password: string;
};

export type CustomerDeleteRequest = {
  email: string;
};

export type CustomerUpdatePasswordRequest = {
  email: string;
  currentPassword: string;
  newPassword: string;
};

export type CustomerUpdateRequest = {
  firstName?: string;
  lastName?: string;
  isVerified?: boolean;
  email: string;
  hasCreatedPasswordForAccount?: boolean;
};

export type CustomerUpdateEmailRequest = {
  email: string;
  newEmail: string;
  password: string;
};

export type ListCustomerParams = {
  limit: number;
  pageNo: number;
  orderBy: keyof Omit<CustomerListObject, "id">;
  searchBy?: Search;
  ascOrDesc: "asc" | "desc";
};

export type Search = {
  key: keyof Omit<CustomerListObject, "id">;
  value: number | string | boolean;
}[];
