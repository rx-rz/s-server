import { customerValues } from "./customer.repository";

export type CustomerRegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
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
