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

const customerListSearch = (search: Search): SQLWrapper[] => {
  let filterQueries = [];
  for (let i of search) {
    switch (i.key) {
      case "isVerified":
        if (typeof i.value === "boolean")
          filterQueries.push(eq(customerTable.isVerified, i.value));
      default:
        filterQueries.push(ilike(customerTable[i.key], `%${i.value}%`));
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
  const dbQuery = ctx.db
    .select(customerValues)
    .from(customerTable)
    .limit(limit)
    .offset((pageNo - 1) * limit)
    .orderBy(
      ascOrDesc === "asc"
        ? asc(customerTable[`${orderBy}`])
        : desc(customerTable[`${orderBy}`])
    );
  if (searchBy) {
    const filterQueries = customerListSearch(searchBy);
    customers = await dbQuery.where(and(...filterQueries));
  } else {
    customers = await dbQuery;
  }
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
