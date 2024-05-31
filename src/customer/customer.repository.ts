import { asc, eq, gte, ilike, or } from "drizzle-orm";
import { ctx } from "../ctx";
import {
  CustomerDeleteRequest,
  CustomerRegisterRequest,
  CustomerUpdateEmailRequest,
  CustomerUpdatePasswordRequest,
  CustomerUpdateRequest,
} from "./customer.types";

const customerTable = ctx.schema.customer;

export const customerValues = {
  firstName: customerTable.firstName,
  lastName: customerTable.lastName,
  email: customerTable.email,
  id: customerTable.id,
  isVerified: customerTable.isVerified,
  createdAt: customerTable.createdAt,
};

const register = async (customerRequest: CustomerRegisterRequest) => {
  const [customer] = await ctx.db
    .insert(customerTable)
    .values(customerRequest)
    .returning(customerValues);
  return customer;
};

const getCustomerDetails = async (customerEmail: string) => {
  const customerDetails = await ctx.db.query.customer.findFirst({
    where: eq(customerTable.email, customerEmail),
    columns: { password: false },
    with: {
      bookings: true,
    },
  });
  return customerDetails;
};

const listCustomer = async () => {
  const customers = await ctx.db.select(customerValues).from(customerTable)
  return customers || [];
};

const deleteCustomer = async (customerRequest: CustomerDeleteRequest) => {
  const [customer] = await ctx.db
    .delete(customerTable)
    .where(eq(customerValues.email, customerRequest.email))
    .returning(customerValues);
  return customer;
};

const updateCustomer = async (customerRequest: CustomerUpdateRequest) => {
  const { email, ...request } = customerRequest;
  const [customer] = await ctx.db
    .update(customerTable)
    .set(request)
    .where(eq(customerTable.email, email))
    .returning(customerValues);
  return customer;
};

const updateCustomerEmail = async (
  customerRequest: CustomerUpdateEmailRequest
) => {
  const [customer] = await ctx.db
    .update(customerTable)
    .set({ email: customerRequest.newEmail })
    .where(eq(customerTable.email, customerRequest.email))
    .returning(customerValues);
  return customer;
};

const updateCustomerPassword = async (
  customerRequest: CustomerUpdatePasswordRequest
) => {
  const [customer] = await ctx.db
    .update(customerTable)
    .set({ password: customerRequest.newPassword })
    .where(eq(customerTable.email, customerRequest.email))
    .returning(customerValues);
  return customer;
};

const getCustomerPassword = async (email: string) => {
  const customerPassword = await ctx.db.query.customer.findFirst({
    where: eq(customerTable.email, email),
    columns: { password: true },
  });
  return customerPassword?.password || "";
};

export const customerRepository = {
  register,
  listCustomer,
  deleteCustomer,
  getCustomerPassword,
  updateCustomer,
  updateCustomerEmail,
  updateCustomerPassword,
  getCustomerDetails,
};
