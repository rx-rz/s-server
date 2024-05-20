import { eq } from "drizzle-orm";
import { ctx } from "../ctx";
import {
  CustomerDeleteRequest,
  CustomerRegisterRequest,
  CustomerUpdateEmailRequest,
  CustomerUpdatePasswordRequest,
  CustomerUpdateRequest,
} from "./customer.types";
import { DuplicateEntryError, NotFoundError } from "../errors";

const customerTable = ctx.schema.customer;

const customer = {
  firstName: customerTable.firstName,
  lastName: customerTable.lastName,
  email: customerTable.email,
  id: customerTable.id,
  isVerified: customerTable.isVerified,
  createdAt: customerTable.createdAt,
};

const register = async (customerRequest: CustomerRegisterRequest) => {
  const customerDetails = await getCustomerDetails(
    customerRequest.email,
    false
  );
  if (customerDetails) {
    throw new DuplicateEntryError(
      `Customer with email ${customerRequest.email} already exists.`
    );
  }
  const [user] = await ctx.db
    .insert(customerTable)
    .values(customerRequest)
    .returning(customer);
  return user;
};

const getCustomerDetails = async (customerEmail: string, isRequired = true) => {
  const [customerDetails] = await ctx.db
    .select(customer)
    .from(customerTable)
    .where(eq(customerTable.email, customerEmail));
  if (!customerDetails && isRequired)
    throw new NotFoundError(
      `Customer with email ${customerEmail} could not be found.`
    );
  return customerDetails;
};

const listCustomer = async () => {
  const users = await ctx.db.select(customer).from(customerTable);
  return users || [];
};

const deleteCustomer = async (customerRequest: CustomerDeleteRequest) => {
  const [deletedUser] = await ctx.db
    .delete(customerTable)
    .where(eq(customer.email, customerRequest.email))
    .returning(customer);
  if (!deletedUser) {
    throw new NotFoundError(
      `customer with email ${customerRequest.email} does not exist.`
    );
  }
  return deletedUser;
};

const updateCustomer = async (customerRequest: CustomerUpdateRequest) => {
  const [updatedCustomer] = await ctx.db
    .update(customerTable)
    .set(customerRequest)
    .where(eq(customerTable.email, customerRequest.email))
    .returning(customer);
  if (!updatedCustomer) {
    throw new NotFoundError(
      `customer with email ${customerRequest.email} does not exist.`
    );
  }
  return updatedCustomer;
};

const updateCustomerEmail = async (
  customerRequest: CustomerUpdateEmailRequest
) => {
  const [updatedCustomer] = await ctx.db
    .update(customerTable)
    .set({ email: customerRequest.newEmail })
    .where(eq(customerTable.email, customerRequest.email))
    .returning(customer);
  if (!updatedCustomer) {
    throw new NotFoundError(
      `customer with email ${customerRequest.email} does not exist.`
    );
  }
  return updatedCustomer;
};

const updateCustomerPassword = async (
  customerRequest: CustomerUpdatePasswordRequest
) => {
  const [updatedCustomer] = await ctx.db
    .update(customerTable)
    .set({ password: customerRequest.newPassword })
    .where(eq(customerTable.email, customerRequest.email))
    .returning(customer);
  if (!updatedCustomer) {
    throw new NotFoundError(
      `customer with email ${customerRequest.email} does not exist.`
    );
  }
  return updatedCustomer;
};

const getCustomerPassword = async (email: string) => {
  const customerPassword = await ctx.db.query.customer.findFirst({
    where: eq(customerTable.email, email),
    columns: { password: true },
  });
  return customerPassword?.password || "";
};

const getCustomerBookings = async (email: string) => {
  await getCustomerDetails(email);
  const customerBookings = await ctx.db.query.customer.findFirst({
    where: eq(customerTable.email, email),
    columns: { password: false },
    with: {
      bookings: true,
    },
  });
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
  getCustomerBookings,
};
