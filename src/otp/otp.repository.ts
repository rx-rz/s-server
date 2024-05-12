import { desc, eq } from "drizzle-orm";
import { ctx } from "../ctx";
import { NotFoundError } from "../errors";
import { generateOtp } from "./otp.helpers";
import { customerRepository } from "../customer/customer.repository";

const otpTable = ctx.schema.userOtps;
const userOtp = {
  expiresAt: otpTable.expiresAt,
  email: otpTable.email,
  otp: otpTable.otp,
};
const createOTP = async (email: string) => {
  const otp = generateOtp();
  const customerDetails = await customerRepository.getCustomerDetails(email);
  if (customerDetails) {
    const [customerOTP] = await ctx.db
      .insert(otpTable)
      .values({ email, otp, expiresAt: Date.now() + 600000 })
      .returning(userOtp);
    return customerOTP;
  }
};

const getOTP = async (email: string) => {
  const otps = await ctx.db
    .select(userOtp)
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
    .returning(userOtp);

  if (!deletedOtps)
    throw new NotFoundError("No OTPs have been provided for this email.");
  return deletedOtps;
};

export const otpRepository = {
  createOTP,
  getOTP,
  deleteOTP,
};
