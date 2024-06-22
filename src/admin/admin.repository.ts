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
  isVerified: adminTable.isVerified,
};

const register = async (adminRequest: AdminCreationRequest) => {
  const [admin] = await ctx.db
    .insert(adminTable)
    .values(adminRequest)
    .returning({ ...adminValues });
  return admin;
};

const getAdminDetails = async (email: string) => {
  const [adminDetails] = await ctx.db
    .select(adminValues)
    .from(adminTable)
    .where(eq(adminTable.email, email));
  return adminDetails;
};

const getRefreshToken = async (email: string) => {
  const [admin] = await ctx.db
    .select({ refreshToken: adminTable.refreshToken })
    .from(adminTable)
    .where(eq(adminTable.email, email));
  return admin.refreshToken || "";
};

const updateRefreshToken = async (email: string, refreshToken: string) => {
  const [admin] = await ctx.db
    .update(adminTable)
    .set({ refreshToken })
    .where(eq(adminTable.email, email))
    .returning({ refreshToken: adminTable.refreshToken });
  return admin.refreshToken || "";
};

const deleteAdmin = async (email: string) => {
  const [adminDeleted] = await ctx.db
    .delete(adminTable)
    .where(eq(adminTable.email, email))
    .returning(adminValues);
  return adminDeleted;
};

const updateAdminDetails = async (adminRequest: AdminUpdateRequest) => {
  const {email, ...request} = adminRequest;
  const [adminUpdated] = await ctx.db
    .update(adminTable)
    .set(request).where(eq(adminTable.email, email))
    .returning(adminValues);
  return adminUpdated;
};

const changeAdminEmail = async (adminRequest: ChangeAdminEmailRequest) => {
  const adminUpdated = await ctx.db
    .update(adminTable)
    .set({ email: adminRequest.newEmail })
    .returning(adminValues);
  return adminUpdated;
};

const changeAdminPassword = async (
  adminRequest: ChangeAdminPasswordRequest
) => {
  const adminUpdated = await ctx.db
    .update(adminTable)
    .set({ password: adminRequest.newPassword })
    .returning(adminValues);
  return adminUpdated;
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
  updateRefreshToken,
  getRefreshToken,
};
