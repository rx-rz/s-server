import { z } from "zod";

const createOTPValidator = z.object({
  email: z
    .string({ required_error: "Email is required!" })
    .email({
      message:
        "Email input is not a valid email. Please correct and try again.",
    })
    .max(255, { message: "Email cannot be more than 255 characters." }),
  role: z.enum(["customer", "admin"]).default("customer"),
  isForSettingPassword: z.boolean().default(false).optional(),
});

const emailValidator = z.object({
  email: z
    .string({ required_error: "Email is required!" })
    .email({
      message:
        "Email input is not a valid email. Please correct and try again.",
    })
    .max(255, { message: "Email cannot be more than 255 characters." }),
});
const verifyOTPValidator = z.object({
  email: z
    .string({ required_error: "Email is required!", invalid_type_error: "Email should be a string" })
    .email({
      message:
        "Email input is not a valid email. Please correct and try again.",
    })
    .max(255, { message: "Email cannot be more than 255 characters." }),
  otp: z
    .number({ invalid_type_error: "OTP should be a number" })
    .min(100000, { message: "Invalid OTP value" }),
  role: z.enum(["customer", "admin"]).default("customer"),
});

export const v = {
  createOTPValidator,
  verifyOTPValidator,
  emailValidator,
};
