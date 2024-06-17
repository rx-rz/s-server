import { eq } from "drizzle-orm";
import { ctx } from "../ctx";
import {
  AdminCreationRequest,
  AdminUpdateRequest,
  ChangeAdminEmailRequest,
  ChangeAdminPasswordRequest,
} from "./admin.types";

const adminTable = ctx.schema.admin;

const adminValues = {
  firstName: adminTable.firstName,
  lastName: adminTable.lastName,
  email: adminTable.email,
  id: adminTable.id,
};

const register = async (adminRequest: AdminCreationRequest) => {
  const [admin] = await ctx.db
    .insert(adminTable)
    .values(adminRequest)
    .returning(adminValues);
  return admin;
};

const getAdminDetails = async (email: string, isRequired = true) => {
  const [adminDetails] = await ctx.db
    .select(adminValues)
    .from(adminTable)
    .where(eq(adminTable.email, email));
  return adminDetails;
};

const deleteAdmin = async (email: string) => {
  const [deletedAdmin] = await ctx.db
    .delete(adminTable)
    .where(eq(adminTable.email, email))
    .returning(adminValues);
  return deletedAdmin;
};

const updateAdminDetails = async (adminRequest: AdminUpdateRequest) => {
  const updatedAdmin = await ctx.db
    .update(adminTable)
    .set(adminRequest)
    .returning(adminValues);
  return updatedAdmin;
};

const changeAdminEmail = async (adminRequest: ChangeAdminEmailRequest) => {
  const updatedAdmin = await ctx.db
    .update(adminTable)
    .set({ email: adminRequest.newEmail })
    .returning(adminValues);
  return updatedAdmin;
};

const changeAdminPassword = async (
  adminRequest: ChangeAdminPasswordRequest
) => {
  const updatedAdmin = await ctx.db
    .update(adminTable)
    .set({ password: adminRequest.newPassword })
    .returning(adminValues);
  return updatedAdmin;
};

const getAdminPassword = async (email: string) => {
  const [admin] = await ctx.db
    .select({ password: adminTable.password })
    .from(adminTable)
    .where(eq(adminTable.email, email));
  return admin.password || "";
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
