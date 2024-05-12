import { eq } from "drizzle-orm";
import { ctx } from "../ctx";
import { DuplicateEntryError, NotFoundError } from "../errors";
import {
  AdminCreationRequest,
  AdminUpdateRequest,
  ChangeAdminEmailRequest,
  ChangeAdminPasswordRequest,
} from "./admin.types";

const adminTable = ctx.schema.admin;

const admin = {
  firstName: adminTable.firstName,
  lastName: adminTable.lastName,
  email: adminTable.email,
  id: adminTable.id,
};

const register = async (adminRequest: AdminCreationRequest) => {
  const adminExists = await getAdminDetails(adminRequest.email, false);
  if (adminExists)
    throw new DuplicateEntryError(
      `Admin with email ${adminRequest.email} has already been created.`
    );
  const [user] = await ctx.db
    .insert(adminTable)
    .values(adminRequest)
    .returning(admin);
  return user;
};

const getAdminDetails = async (email: string, isRequired = true) => {
  const [adminDetails] = await ctx.db
    .select(admin)
    .from(adminTable)
    .where(eq(adminTable.email, email));
  if (!adminDetails && isRequired)
    throw new NotFoundError(`Admin with email ${email} could not be found.`);
  return adminDetails;
};

const deleteAdmin = async (email: string) => {
  const adminExists = await getAdminDetails(email);
  if (!adminExists)
    throw new NotFoundError(`Admin with email ${email} could not be found.`);
  const [deletedAdmin] = await ctx.db
    .delete(adminTable)
    .where(eq(adminTable.email, email)).returning(admin);
  return deletedAdmin;
};

const updateAdminDetails = async (adminRequest: AdminUpdateRequest) => {
  const adminExists = await getAdminDetails(adminRequest.email);
  if (!adminExists)
    throw new NotFoundError(
      `Admin with email ${adminRequest.email} could not be found.`
    );
  const updatedAdmin = await ctx.db
    .update(adminTable)
    .set(adminRequest)
    .returning(admin);
  return updatedAdmin;
};

const changeAdminEmail = async (adminRequest: ChangeAdminEmailRequest) => {
  const adminExists = await getAdminDetails(adminRequest.email);
  if (!adminExists)
    throw new NotFoundError(
      `Admin with email ${adminRequest.email} could not be found.`
    );
  const updatedAdmin = await ctx.db
    .update(adminTable)
    .set({ email: adminRequest.newEmail })
    .returning(admin);
  return updatedAdmin;
};

const changeAdminPassword = async (
  adminRequest: ChangeAdminPasswordRequest
) => {
  const adminExists = await getAdminDetails(adminRequest.email);
  if (!adminExists)
    throw new NotFoundError(
      `Admin with email ${adminRequest.email} could not be found.`
    );
  const updatedAdmin = await ctx.db
    .update(adminTable)
    .set({ password: adminRequest.newPassword })
    .returning(admin);
  return updatedAdmin;
};

const getAdminPassword = async (email: string) => {
  const adminPassword = await ctx.db.query.admin.findFirst({
    where: eq(adminTable.email, email),
    columns: { password: true },
  });
  return adminPassword?.password || "";
};

export const adminRepository = {
  changeAdminEmail,
  changeAdminPassword,
  getAdminPassword,
  getAdminDetails,
  register,
  deleteAdmin,
  updateAdminDetails,
};
