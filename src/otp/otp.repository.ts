import { desc, eq } from "drizzle-orm";
import { ctx } from "../ctx";
import { NotFoundError } from "../errors";
import { generateOtp } from "./otp.helpers";
import { customerRepository } from "../customer/customer.repository";

const otpTable = ctx.schema.userOtps;
const userOtpValues = {
  expiresAt: otpTable.expiresAt,
  email: otpTable.email,
  otp: otpTable.otp,
  role: otpTable.role
};
const createOTP = async (email: string, role: "admin" | "customer") => {
  const otpNo = generateOtp();
  const [customerOTP] = await ctx.db
    .insert(otpTable)
    .values({ email, otp: otpNo, role, expiresAt: Date.now() + 600000})
    .returning(userOtpValues);
  return customerOTP;
};

const getOTP = async (email: string) => {
  const otps = await ctx.db
    .select(userOtpValues)
    .from(otpTable)
    .where(eq(otpTable.email, email))
    .orderBy(desc(otpTable.expiresAt));
  if (otps.length === 0)
    throw new NotFoundError("No OTP has been provided for this email.");
  return otps[0];
};

const deleteOTP = async (email: string) => {
  const deletedOtps = await ctx.db
    .delete(otpTable)
    .where(eq(otpTable.email, email))
    .returning(userOtpValues);

  if (!deletedOtps)
    throw new NotFoundError("No OTPs have been provided for this email.");
  return deletedOtps;
};

export const otpRepository = {
  createOTP,
  getOTP,
  deleteOTP,
};
