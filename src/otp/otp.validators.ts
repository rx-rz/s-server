import { z } from "zod";

const createOTPValidator = z.object({
  email: z.string({ required_error: "Email is required!" }).email({
    message: "Email input is not a valid email. Please correct and try again.",
  }),
});

const verifyOTPValidator = z.object({
  email: z.string({ required_error: "Email is required!" }).email({
    message: "Email input is not a valid email. Please correct and try again.",
  }),
  otp: z
    .number({ invalid_type_error: "OTP should be a number" })
    .min(100000, { message: "Invalid OTP value" }),
});

export const v = {
  createOTPValidator,
  verifyOTPValidator,
};
