import { SQLWrapper, and, asc, desc, eq, ilike } from "drizzle-orm";
import { ctx } from "../ctx";
import {
  CustomerDeleteRequest,
  CustomerRegisterRequest,
  CustomerUpdateEmailRequest,
  CustomerUpdatePasswordRequest,
  CustomerUpdateRequest,
  ListCustomerParams,
  Search,
} from "./customer.types";

const customerTable = ctx.schema.customer;
const bookingTable = ctx.schema.booking;
const paymentsTable = ctx.schema.payment;

export const customerValues = {
  firstName: customerTable.firstName,
  lastName: customerTable.lastName,
  email: customerTable.email,
  id: customerTable.id,
  isVerified: customerTable.isVerified,
  hasCreatedPasswordForAccount: customerTable.hasCreatedPasswordForAccount,
  createdAt: customerTable.createdAt,
};

const register = async (customerRequest: CustomerRegisterRequest) => {
  const [customer] = await ctx.db
    .insert(customerTable)
    .values(customerRequest)
    .returning(customerValues);
  return customer;
};

const getCustomerDetails = async (email: string) => {
  const [customerDetails] = await ctx.db
    .select(customerValues)
    .from(customerTable)
    .where(eq(customerTable.email, email));
  return customerDetails;
};

const getCustomerWithBookingAndPaymentDetails = async (email: string) => {
  const customerDetails = await ctx.db.query.customer.findFirst({
    where: eq(customerTable.email, email),
    columns: { password: false },
    with: {
      bookings: true,
      payments: true,
    },
  });
  return customerDetails;
};

const customerListSearch = (search: Search): SQLWrapper[] => {
  let filterQueries = [];
  for (let i of search) {
    switch (i.key) {
      case "isVerified":
        if (typeof i.value === "boolean")
          filterQueries.push(eq(customerTable.isVerified, i.value));
      default:
        filterQueries.push(
          ilike(customerTable[i.key], `%${i.value.toString()}%`)
        );
    }
  }
  return filterQueries;
};

const listCustomer = async ({
  limit,
  orderBy,
  pageNo,
  searchBy,
  ascOrDesc,
}: ListCustomerParams) => {
  let customers;
  const dbQuery = ctx.db.select(customerValues).from(customerTable);
  if (searchBy) {
    const filterQueries = customerListSearch(searchBy);
    customers = await dbQuery.where(and(...filterQueries));
  } else {
    customers = await dbQuery;
  }
  const customerList = await dbQuery;
  customers = await dbQuery
    .limit(limit)
    .offset((pageNo - 1) * limit)
    .orderBy(
      ascOrDesc === "asc"
        ? asc(customerTable[`${orderBy}`])
        : desc(customerTable[`${orderBy}`])
    );
  return { customers, noOfCustomers: customerList.length };
};

const deleteCustomer = async (customerRequest: CustomerDeleteRequest) => {
  const [deletedCustomer] = await ctx.db
    .delete(customerTable)
    .where(eq(customerValues.email, customerRequest.email))
    .returning(customerValues);
  return deletedCustomer;
};

const updateCustomer = async (customerRequest: CustomerUpdateRequest) => {
  const { email, ...request } = customerRequest;
  const [updatedCustomer] = await ctx.db
    .update(customerTable)
    .set(request)
    .where(eq(customerTable.email, email))
    .returning(customerValues);
  return updatedCustomer;
};

const updateCustomerEmail = async (
  customerRequest: CustomerUpdateEmailRequest
) => {
  const [updatedCustomer] = await ctx.db
    .update(customerTable)
    .set({ email: customerRequest.newEmail })
    .where(eq(customerTable.email, customerRequest.email))
    .returning(customerValues);
  return updatedCustomer;
};

const updateCustomerPassword = async (
  customerRequest: CustomerUpdatePasswordRequest
) => {
  const [updatedCustomer] = await ctx.db
    .update(customerTable)
    .set({ password: customerRequest.newPassword })
    .where(eq(customerTable.email, customerRequest.email))
    .returning(customerValues);
  return updatedCustomer;
};

const getCustomerPassword = async (email: string) => {
  const [customer] = await ctx.db
    .select({ password: customerTable.password })
    .from(customerTable)
    .where(eq(customerTable.email, email));
  return customer.password || "";
};

const getLastFiveCustomers = async () => {
  const customers = await ctx.db
    .select(customerValues)
    .from(customerTable)
    .orderBy(desc(customerTable.createdAt))
    .limit(5);
  return customers;
};

export const customerRepository = {
  register,
  listCustomer,
  deleteCustomer,
  getCustomerPassword,
  updateCustomer,
  updateCustomerEmail,
  updateCustomerPassword,
  getCustomerWithBookingAndPaymentDetails,
  getCustomerDetails,
  getLastFiveCustomers,
};
